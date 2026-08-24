// Helix Method Loop — method manual + deterministic gate calculator.
// The methodology lives in the bundled manual (read via ghost_manual); this
// sandbox logic only computes the weighted ambiguity/drift gate scores so the
// quantitative thresholds stay auditable instead of being estimated mentally.

const GATES = {
  ambiguity: {
    threshold: 0.2,
    greenfield: { goal: 0.4, constraints: 0.3, success: 0.3 },
    brownfield: { goal: 0.34, constraints: 0.26, success: 0.26, context: 0.14 }
  },
  drift: {
    threshold: 0.3,
    weights: { goal: 0.5, constraints: 0.3, ontology: 0.2 }
  }
};

function round(n) {
  return Math.round(n * 1000) / 1000;
}

cindy.onHostMessage(async function (msg) {
  if (msg.type !== 'tool-call' || msg.tool !== 'helix_gate') return;
  const args = msg.args || {};
  const fail = async (message) =>
    cindy.send({ type: 'tool-result', callId: msg.callId, ok: false, error: { code: 'INVALID_ARGS', message } });

  const dim = (name) => {
    const v = args[name];
    return typeof v === 'number' && v >= 0 && v <= 1 ? v : null;
  };

  if (args.mode === 'ambiguity') {
    const weights = args.brownfield ? GATES.ambiguity.brownfield : GATES.ambiguity.greenfield;
    const contributions = {};
    let claritysum = 0;
    for (const name of Object.keys(weights)) {
      const v = dim(name);
      if (v === null) return fail(`ambiguity 模式缺少或非法维度分 "${name}"(0–1)${name === 'context' ? '；棕地模式必须提供 context' : ''}`);
      contributions[name] = { clarity: v, weight: weights[name], weighted: round(v * weights[name]) };
      claritysum += v * weights[name];
    }
    const score = round(1 - claritysum);
    await cindy.send({
      type: 'tool-result',
      callId: msg.callId,
      ok: true,
      result: {
        gate: 'ambiguity',
        profile: args.brownfield ? 'brownfield' : 'greenfield',
        score,
        threshold: GATES.ambiguity.threshold,
        pass: score <= GATES.ambiguity.threshold,
        contributions,
        verdict: score <= GATES.ambiguity.threshold
          ? '歧义门通过：可以结晶 Seed。'
          : '歧义门未过：回到访谈/查证，优先补 weighted 值最低的维度。评分依据必须已写在对话里。'
      }
    });
    return;
  }

  if (args.mode === 'drift') {
    const weights = GATES.drift.weights;
    const contributions = {};
    let score = 0;
    for (const name of Object.keys(weights)) {
      const v = dim(name);
      if (v === null) return fail(`drift 模式缺少或非法维度分 "${name}"(0–1)`);
      contributions[name] = { drift: v, weight: weights[name], weighted: round(v * weights[name]) };
      score += v * weights[name];
    }
    score = round(score);
    await cindy.send({
      type: 'tool-result',
      callId: msg.callId,
      ok: true,
      result: {
        gate: 'drift',
        score,
        threshold: GATES.drift.threshold,
        pass: score <= GATES.drift.threshold,
        contributions,
        verdict: score <= GATES.drift.threshold
          ? '漂移门通过：可以出证据收据。'
          : '漂移门超标：停止宣称完成——回 clarify 走 reseed，或回滚越界部分。'
      }
    });
    return;
  }

  if (args.mode === 'loop') {
    const total = args.ac_total;
    const history = args.ac_passed_history;
    if (!Number.isInteger(total) || total < 1) return fail('loop 模式需要 ac_total(≥1 的整数)');
    if (!Array.isArray(history) || history.length < 1 || history.some((n) => !Number.isInteger(n) || n < 0 || n > total)) {
      return fail('loop 模式需要 ac_passed_history(非空整数数组,每项 0–ac_total)');
    }
    const maxLoops = Number.isInteger(args.max_loops) && args.max_loops >= 1 && args.max_loops <= 10 ? args.max_loops : 5;
    const loopsUsed = history.length;
    const last = history[history.length - 1];
    const prev = loopsUsed >= 2 ? history[history.length - 2] : null;

    let verdict, reason;
    if (last === total) {
      verdict = 'converged';
      reason = '全部 AC 通过。跑完漂移门与反熵清退后出最终收据，环结束。';
    } else if (args.repeated_same_error === true) {
      verdict = 'unstuck';
      reason = '打转（同一错误重复出现）：停止编码，走五视角脱困后再进圈。';
    } else if (args.oscillation === true) {
      verdict = 'unstuck';
      reason = '震荡（修 A 坏 B 来回）：停止编码，走五视角脱困后再进圈。';
    } else if (loopsUsed >= maxLoops) {
      verdict = 'cap-reached';
      reason = `已达硬圈数上限 ${maxLoops}：停止迭代，向用户汇报 AC 现状与每圈失败分析，给出缩小范围 reseed / 接受部分完成 / 换根本方案三个选项。`;
    } else if (prev !== null && last <= prev) {
      verdict = 'unstuck';
      reason = '无进展（本圈 AC 通过数未超过上圈）：视为停滞，先脱困再进圈。';
    } else {
      verdict = 'continue';
      reason = '有上升：写完本圈失败分析后进入下一圈。';
    }
    await cindy.send({
      type: 'tool-result',
      callId: msg.callId,
      ok: true,
      result: {
        gate: 'loop',
        verdict,
        reason,
        ac_passed: last,
        ac_total: total,
        loops_used: loopsUsed,
        loops_remaining: Math.max(0, maxLoops - loopsUsed),
        history
      }
    });
    return;
  }

  return fail('mode 必须是 "ambiguity"、"drift" 或 "loop"');
});
