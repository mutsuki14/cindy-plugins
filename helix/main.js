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

  const pickThreshold = (def, min) => {
    if (args.threshold === undefined) return def;
    if (typeof args.threshold !== 'number' || args.threshold < min || args.threshold > def) {
      return null; // 只允许收紧：min ≤ threshold ≤ 默认值
    }
    return args.threshold;
  };

  if (args.mode === 'ambiguity') {
    const threshold = pickThreshold(GATES.ambiguity.threshold, 0.05);
    if (threshold === null) return fail(`ambiguity 门槛只能收紧：threshold 须在 0.05–${GATES.ambiguity.threshold} 之间`);
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
        threshold,
        tightened: threshold !== GATES.ambiguity.threshold,
        pass: score <= threshold,
        contributions,
        verdict: score <= threshold
          ? '歧义门通过：可以结晶 Seed。'
          : '歧义门未过：回到访谈/查证，优先补 weighted 值最低的维度。评分依据必须已写在对话里。'
      }
    });
    return;
  }

  if (args.mode === 'drift') {
    const threshold = pickThreshold(GATES.drift.threshold, 0.1);
    if (threshold === null) return fail(`drift 门槛只能收紧：threshold 须在 0.1–${GATES.drift.threshold} 之间`);
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
        threshold,
        tightened: threshold !== GATES.drift.threshold,
        pass: score <= threshold,
        contributions,
        verdict: score <= threshold
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
    } else if (prev !== null && (total - last) > (last - prev) * (maxLoops - loopsUsed)) {
      verdict = 'unstuck';
      reason = `收益递减投影：按本圈速度（每圈 +${last - prev} 条 AC），剩余 ${maxLoops - loopsUsed} 圈内无法通过全部 ${total} 条。先脱困换路径，或与用户商量缩小范围 reseed。`;
    } else {
      verdict = 'continue';
      reason = '有上升且按当前速度可在圈数内收敛：写完本圈失败分析后进入下一圈。';
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

  if (args.mode === 'receipt') {
    const checks = args.checks;
    const okScopes = ['target', 'regression', 'other'];
    if (!Array.isArray(checks) || checks.length < 1 || checks.some((c) =>
      !c || typeof c.name !== 'string' || !Number.isInteger(c.exit_code) ||
      typeof c.fresh !== 'boolean' || !okScopes.includes(c.scope))) {
      return fail('receipt 模式需要 checks(非空数组,每项 {name, exit_code, fresh, scope: target|regression|other})');
    }
    const uncovered = Array.isArray(args.uncovered) ? args.uncovered.filter((u) => typeof u === 'string') : [];
    const failed = checks.filter((c) => c.exit_code !== 0).map((c) => c.name);
    const stale = checks.filter((c) => c.fresh !== true).map((c) => c.name);
    const hasTarget = checks.some((c) => c.scope === 'target' && c.exit_code === 0 && c.fresh === true);
    const hasRegression = checks.some((c) => c.scope === 'regression' && c.exit_code === 0 && c.fresh === true);

    let grade, reason;
    if (failed.length || stale.length) {
      grade = 'C';
      reason = `存在失败或不新鲜的检查（失败: ${failed.join(', ') || '无'}；不新鲜: ${stale.join(', ') || '无'}）`;
    } else if (!hasTarget) {
      grade = 'C';
      reason = '没有直接针对目标的新鲜证据（scope=target）';
    } else if (hasRegression && uncovered.length === 0) {
      grade = 'A';
      reason = '目标证据 + 回归证据齐全，无已知未覆盖面';
    } else {
      grade = 'B';
      reason = hasRegression ? `有未覆盖面: ${uncovered.join('; ')}` : '缺回归证据' + (uncovered.length ? `；未覆盖: ${uncovered.join('; ')}` : '');
    }
    await cindy.send({
      type: 'tool-result',
      callId: msg.callId,
      ok: true,
      result: {
        gate: 'receipt',
        grade, reason,
        claim_allowed: grade !== 'C',
        failed, stale, uncovered,
        verdict: grade === 'C'
          ? '置信 C：不得宣称"完成"——改说"实现了 X，尚未验证 Y"，或补齐检查后重新评级。'
          : `置信 ${grade}：可以宣称完成${grade === 'B' ? '，但收据必须列出残余风险' : ''}。等级由工具按原始事实判定，不要手改。`
      }
    });
    return;
  }

  if (args.mode === 'calibrate') {
    const records = args.records;
    if (!Array.isArray(records) || records.some((r) =>
      !r || typeof r.ambiguity !== 'number' || r.ambiguity < 0 || r.ambiguity > 1 ||
      !Number.isInteger(r.loops) || r.loops < 1)) {
      return fail('calibrate 模式需要 records(数组,每项 {ambiguity: 0–1, loops: ≥1 整数, drift?: 0–1})');
    }
    const n = records.length;
    const mean = (xs) => (xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
    const high = records.filter((r) => r.loops >= 3);
    const low = records.filter((r) => r.loops <= 1);
    const drifts = records.map((r) => r.drift).filter((d) => typeof d === 'number');
    const stats = {
      n,
      high_rework: { count: high.length, mean_ambiguity: mean(high.map((r) => r.ambiguity)) },
      low_rework: { count: low.length, mean_ambiguity: mean(low.map((r) => r.ambiguity)) },
      mean_drift: mean(drifts)
    };
    let recommendation;
    if (n < 5) {
      recommendation = `样本不足（${n}/5）：继续在每次 retro 时追加校准记录，暂不调门槛。`;
    } else if (high.length < 3) {
      recommendation = '高返工（≥3 圈）样本不足 3 条：当前歧义门表现尚可，维持默认门槛。';
    } else if (stats.high_rework.mean_ambiguity <= 0.2) {
      const suggested = Math.max(0.05, round(stats.high_rework.mean_ambiguity - 0.02));
      recommendation = `自评偏乐观：高返工任务的歧义分平均 ${stats.high_rework.mean_ambiguity}，当时都过了门却平均返工 3+ 圈。建议此类任务门槛收紧为 ${suggested}（下次 clarify 时给 helix_gate 传 threshold: ${suggested}），并把本建议记入 learnings。`;
    } else {
      recommendation = '高返工任务的歧义分本就超标（>0.2）——问题不在门槛在执行：检查是否存在未过门就动工的情况。';
    }
    await cindy.send({
      type: 'tool-result',
      callId: msg.callId,
      ok: true,
      result: { gate: 'calibrate', ...stats, recommendation }
    });
    return;
  }

  return fail('mode 必须是 "ambiguity"、"drift"、"loop"、"receipt" 或 "calibrate"');
});
