# Helix Method Loop（Helix 方法环）

零配置工程方法环 Cindy 插件：融合 Aegis 的证据纪律与 Ouroboros 的进化闭环，并吸收 Superpowers 系工作流的全部关键实践。**不需要任何额外 LLM 设置**——没有 API key、Python、守护进程；量化门槛由 `helix_gate` 工具确定性计算，多模型共识改为同宿主多人格子代理，持久化只用项目内纯文本 `.helix/`。

## 结构

```
manual/
  core/     MANUAL.md 总路由(分级/努力度阶梯/索引/口令) + personas.md 九人格
  clarify/  MANUAL.md 访谈+歧义门+Seed + grill.md 压测 + brownfield.md 棕地考古
  build/    MANUAL.md 基线优先 + plan.md 计划 + tdd.md + debugging.md
            + subagents.md 派发与两阶段评审 + git.md
  verify/   MANUAL.md 三级评估门+收据 + review.md 代码评审
  evolve/   MANUAL.md 循环裁决+脱困+账本+反熵 + retro.md 复盘学习环
main.js     helix_gate：歧义门/漂移门/loop 裁决的确定性计算器
```

## 与三个上游框架的对照

| 能力 | Superpowers | Aegis | Ouroboros | Helix |
|---|---|---|---|---|
| 额外安装/配置 | 插件安装，技能常驻会话上下文 | 插件/脚本安装 | Python 3.12+、MCP 注册、可选 API key | **仅装插件；手册按需加载，零常驻成本** |
| 简单任务开销 | 强制工作流（"mandatory, not suggestions"） | 快路径 | 全流程偏重 | **L0 快路径 + 努力度阶梯升降档** |
| 需求澄清 | 苏格拉底访谈 | 访谈 + grill | 访谈 + 本体论 + 量化歧义门 | **访谈 + 本体 + 歧义门（工具确定性计算）+ 棕地考古** |
| 规格锁定 | 设计文档 | Spec Brief | 不可变 Seed | **不可变 Seed + 显式 reseed 纪律** |
| 计划/执行 | writing/executing-plans | 同源 | Double Diamond | **计划深读版（2–15 分钟任务粒度 + 批次检查点）** |
| TDD | 无差别强制，先于测试的代码删除 | 路由开关 | — | **按风险路由；strict 模式同等严格 + 六大反模式** |
| 完成验证 | verification-before-completion | 证据收据 + 置信 A/B/C | 三段评估门（要多模型） | **三级门 + 收据 + 漂移门，共识门用多人格子代理（零配置）** |
| 收敛/停滞 | — | — | 停滞 4 模式 + 横向思维 + 硬代数上限 | **loop 裁决工具化（可审计）+ 五视角脱困 + 5 圈硬上限** |
| 跨任务学习 | — | — | auto-retro | **复盘四问 + learnings 账本 + 回读闭环** |
| 长任务续航 | — | long-task-continuation | ralph 持久循环 | **append-only journal + 恢复协议** |
| 人格/评审 | 两阶段评审 | 评审提示词 | 九人格（需运行时加载） | **九人格纯文本清单 + 派发即用提示词 + 两阶段评审** |
| 权威边界 | 强制流程 | 用户优先 | 契约锁定 | **用户与项目规则永远最高；纪律为风险服务** |

## 跨宿主版本

要在 Cindy 之外（Claude Code / Codex / OpenCode / Pi / OMP 等）使用 Helix，见独立技能包仓库：[mutsuki14/helix](https://github.com/mutsuki14/helix)。同一宿主不要同时装两个版本。

## 维护约定

更新 Helix 时必须同步三处、版本号一致：本目录（含 `ghost_forge_pack` 重打包）、独立技能包仓库 [mutsuki14/helix](https://github.com/mutsuki14/helix)（转换规则见其 [MAINTAINING.md](https://github.com/mutsuki14/helix/blob/main/MAINTAINING.md)）、已装入实例。门槛逻辑改动须在 `main.js` 与对方仓库 `scripts/gate.mjs` 双端同改并测试。

## 使用

装入并开启后：`$helix <任务>` 显式进环；或直接布置工程任务，Agent 会按 `whenToUse` 自动想起。

### 显式口令详解

口令只是快捷方式：不喊口令、直接布置工程任务时，Agent 也会按任务风险自动分级路由；自然语言同义表达（如"审问这个计划"、"卡住了"）同样触发。在 Cindy 中用 `$helix` 前缀点名。

| 口令 | 做什么 | 什么时候用 | 你会得到 |
|---|---|---|---|
| `helix: <任务>` | 显式进环：先做 L0/L1/L2 复杂度分级，再按级别走快路径 / 迷你环 / 完整环 | 想强制用完整纪律做一件事 | 分级结论 + 对应流程的推进 |
| `helix seed` | 只澄清不执行：苏格拉底访谈 + 歧义评分门（≤0.2 才过），把共识结晶成不可变 Seed 规格 | 需求还含糊，想先对齐再决定做不做 | Seed：目标 / 非目标 / 约束 / 可验证的验收标准 / 本体 / 停止条件 |
| `helix grill` | 压力测试：以"试图推翻"立场审问既有计划/设计，一次一个问题，追最脆弱假设、被放弃的替代方案、失败爆炸半径 | 动工前想把方案烤透；评审别人给的方案 | 压测结论：存活的方案 + 修正点清单 + 未消除的风险 |
| `helix plan` | 把已结晶的 Seed 拆成可执行计划：任务粒度 2–15 分钟、每个任务带精确文件路径与验证动作、批次即安全检查点 | 跨会话 / 需分批审批 / 要派多个实现者的大任务 | `.helix/plan.md` 计划文档 |
| `helix review` | 派独立评审员（未参与实现）做生产就绪度评审：正确性 / 契约 / 归属 / 复杂度 / 测试 / 安全 | 合并前、高风险改动完成后 | 按 critical/major/minor 分级的发现清单；critical 阻塞合并 |
| `helix unstuck` | 停滞诊断（打转 / 震荡 / 无进展 / 收益递减）+ 五视角脱困：简化者、黑客、反对者、架构师、研究者各给一句诊断 | 同一问题反复修不好、迭代不收敛、没思路 | 五条不同方向的出路 + 选定的新路径 |
| `helix status` | 读 `.helix/journal.md` 账本汇报：AC 通过情况、当前圈数、已验证事实、下一步 | 新会话接续长任务；想知道进展到哪了 | 当前圈状态摘要 |
| `helix retro` | 复盘四问：预测偏差、返工根因、可复用打法、项目地雷；有价值的教训入账 | 一个 L2 任务收尾后；一次代价高昂的失败后 | `.helix/learnings.md` 新增条目（下个任务开工时会被回读） |
| `helix adr` | 记录一条架构决策：背景 / 决定 / 放弃项 / 重审触发器 | 做出改变架构、契约或技术选型的决定时 | `.helix/decisions.md`（或项目已有 ADR 目录）新增一条 |
