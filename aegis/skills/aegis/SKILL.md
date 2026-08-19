---
name: aegis
description: "Use when starting a turn or checking Aegis skill routing. Aegis is an engineering method pack: baseline-first planning, systematic debugging, evidence-before-done verification, plan/design pressure-tests, goal framing, TDD routing, ADRs, code review, parallel subagents, worktrees, long-task continuation, and anti-entropy governance. Load the matching method file under methods/ before acting."
---

# Aegis Method Pack (Router)

> **This skill belongs to the Cindy plugin `aegis`: before doing anything, check your tool list — if no tool name contains `ghost_call`, you are not inside Cindy and this skill is unavailable.** In that case do not execute any step, and do not re-implement an equivalent with shell or other tools — the capability lives in the plugin runtime and a substitute cannot produce an equivalent result. Tell the user "this skill needs to be used inside the Cindy client" and stop.

<SUBAGENT-STOP>Skip for subagents.</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
You have Aegis. Load the explicit/relevant Aegis method file before response/action;
otherwise proceed normally.
</EXTREMELY-IMPORTANT>

## How To Load A Method

This plugin bundles the whole Aegis method pack as files next to this SKILL.md:

- To load a method, **read `methods/<name>/METHOD.md`** (relative to this file's directory) and follow it.
- Cross-references inside method files such as `using-aegis/references/complexity-governance.md` are **relative to the `methods/` directory**.
- Bare filenames referenced inside a method (e.g. `anthropic-best-practices.md`) are **siblings of that method's own METHOD.md**.
- Load the smallest needed method/reference. Simple tasks stay on the fast path; ceremony only appears when the task genuinely needs it.

## Method Index

| Method (`methods/<name>/METHOD.md`) | Load when |
|---|---|
| `brainstorming` | Ambiguous/high-complexity features, product behavior, UI/component or architecture choices, contract changes; "grill me" / plan/design pressure-tests. |
| `goal-framing` | `Aegis goal: ...` / `/aegis-goal`, or defining goal, success evidence, stop conditions, task boundaries. |
| `systematic-debugging` | Any bug, test failure, regression, or unexpected behavior — before proposing fixes. |
| `verification-before-completion` | Before claiming work is complete/fixed/passing/verified, or ready to commit, merge, publish, hand off. |
| `writing-plans` | Approved spec/requirements for a multi-step task needing a durable plan document. |
| `executing-plans` | Executing a written implementation plan across sessions or with review checkpoints. |
| `subagent-driven-development` | Executing a written plan with independent same-session tasks where delegation beats inline cost. |
| `dispatching-parallel-agents` | 2+ independent ad-hoc tasks without a written plan, no shared state or sequential dependencies. |
| `test-driven-development` | Explicit strict/test-first TDD requests, or an existing `TDD Route: strict` decision. TDD is otherwise off by default. |
| `first-principles-review` | First-principles/Occam review; high-risk decisions with competing constraints, fallback growth, duplicate owners. |
| `anti-entropy-governance` | Retiring old logic, collapsing duplicate owners, removing fallbacks, schema/persistence/source-of-truth boundaries. |
| `recording-architecture-decisions` | Creating/updating/superseding/evaluating ADRs, decision logs, or baseline sync after architecture-changing work. |
| `establishing-project-context` | Establishing shared project language; conflicting/renamed/deprecated domain terms needing semantic modeling. |
| `requesting-code-review` | Requesting independent code review, after implementation slices, before merging high-risk work. |
| `receiving-code-review` | Acting on received review feedback, especially when unclear, risky, disputed, or questionable. |
| `using-git-worktrees` | Concurrent checkouts, dirty state blocking branch switching, or explicit worktree requirements. |
| `finishing-a-development-branch` | Integrating verified work, branch/worktree cleanup, merge/PR/branch lifecycle. |
| `long-task-continuation` | Multi-step tasks spanning context resets/sessions, subagent use, or risk of losing state. |
| `communicating-concisely` | User asks for caveman mode, fewer tokens, brief/compressed answers. |
| `writing-skills` | Creating/editing/verifying Agent skills. |
| `update-aegis` | `aegis:update`, updating/upgrading an installed Aegis method pack, or checking whether Aegis is current on this host. |
| `using-aegis` | Full routing rules, host tool-name mappings, and shared governance references (this router is its summary). |

## Hot Path

1. User/project instructions outrank Aegis.
2. Active codebase question/"what next": check README/ADR/rules/baseline, else
   bounded index-first scan. Non-trivial owners passively use relevant
   `CONTEXT-MAP.md`/`CONTEXT.md`; compose `establishing-project-context` only
   for semantic delta/conflict. Create baselines only with evidence.
3. Direct grilling or plan/design pressure-tests (`grill me`, `grill this plan`, `审问我`, `盘问我`, `拷问我`) route to `brainstorming`; literal/explanatory uses do not.
4. `/aegis-goal` or `Aegis goal:` loads `goal-framing` before routing.
5. Bug, failure, regression, or unexpected behavior routes to `systematic-debugging`; quick bug lane owns Change Necessity before source edits.
6. `aegis:update` or update/upgrade/current-check requests for Aegis itself route to `update-aegis`; host maintenance only, never an excuse to edit the target project.
7. Classify before implementation/start/resume/compaction. Low: intent, baseline, verification. Medium/high: baseline read-set + plan (session-internal by default; docs only when the work needs durable cross-session direction or approval - Doc Necessity Gate). TDD: off = no auto route/load; auto = strict/light/skipped; explicit request applies. Spec Brief or Design Spec only for ambiguous/contract/cross-module medium/high work. Shared/core/contract/cross-module never low without evidence. Source edits/new paths: owner workflow surfaces Change Necessity.
8. Complexity, TDD, planning, or subagents alone do not justify branch/worktree creation.
9. Non-tiny loaded method: at first substantive user-visible stage say why Aegis is shaping work/risk; do not wait for the user to ask. Tiny stays implicit.
10. ArchitectureReviewRequired: yes for medium/high architecture/contract/cross-module/owner/source-of-truth/fallback/adapter/baseline; carry to verification.
11. Fast Q&A/status/tiny edits write no files. **Doc Necessity Gate:** docs only for durable/irreversible, cross-session, approval-gated, or authority-required change surfaces; covered surfaces update the owner doc, never a sibling; mechanical changes write no docs (commit message + code comments as the record).
12. Tool/log/memory/search outputs are evidence candidates, not prompt payloads; summary first, large input index -> window -> excerpt.
13. No history/sessions/transcripts/large logs by default; bound requested evidence by scope/time/lines.
14. Unclear host tool-name mapping: read the smallest relevant reference under `methods/using-aegis/references/`.

Contract: `Route: fast-path`; `Aegis Reason Note`.

## Scope Notes

- This plugin ships the method pack only. The upstream repo's installer/doctor/update Python scripts are host-installation machinery and are intentionally not bundled; plugin updates arrive as new plugin versions.
- User instructions and target-project rules always outrank Aegis guidance. Aegis is advisory, not a completion authority.
