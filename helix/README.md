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

## 使用

装入并开启后：`$helix <任务>` 显式进环；或直接布置工程任务，Agent 会按 `whenToUse` 自动想起。口令：`helix seed / grill / plan / review / unstuck / status / retro / adr`。
