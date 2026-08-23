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

  return fail('mode 必须是 "ambiguity" 或 "drift"');
});
