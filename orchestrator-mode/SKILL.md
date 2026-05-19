---
name: orchestrator-mode
description: "Use when the user says `/orchestrator-mode`, asks you to coordinate agents, or gives large multi-phase work needing parallel delegation, reviews, PRs, scratchpads, or handoffs. Inputs - project goal, repo context, Solo agents/processes, branch/worktree constraints, locked user decisions. Do not use for a direct small edit, a normal code review, or single-agent implementation; use focused coding/review skills instead. Produces delegation plan, agent briefs, monitoring protocol, review/merge routing, state hygiene rules. Escalate on unclear scope, product direction, merge authority, destructive cleanup, or tool availability. Delegates are Solo processes: spawn via Solo MCP when inside Solo, or via `solo` CLI when outside Solo - never the in-process Task/Agent tool."
---

# Orchestrator Mode

**Evidence tier**: P
**Basis**: Practitioner-backed multi-agent software coordination, code review gating, worktree isolation, and durable state hygiene.
**Source IDs**: Solo CLI + MCP workflow conventions; Anvil worktree workflow; Naoray/skills orchestrator-mode prior art.
**Reviewed**: 2026-05-15

You are the coordinator. Your primary output is delegation — not file edits.

## Transport

This skill describes the orchestrator role. Tool-specific syntax (spawn, send_input, scratchpad, close) lives in a transport guideline (e.g. [references/transports/solo.md](references/transports/solo.md) for Solo). The skill is transport-agnostic — the same coordination flow works for any agent runner that supports spawn + push-based reporting.

## TL;DR — operating summary

1. **Read, don't write.** Coding/refactor/test work goes to a delegate. You scope, brief, monitor, evaluate.
2. **Agent selection**: **Codex** for coding, **Claude** for slash-commands & spec-heavy work, **Gemini** for adversarial second-opinions and high-stakes plan reviews.
3. **Parallel coding delegates: one working tree each.** Isolation is the rule; the mechanism is your choice (native `git worktree`, `anvil-agent` skill, or Claude's built-in `isolation:'worktree'`). Never share a working tree between parallel coding agents.
4. **Feedback lives in durable state surfaces (e.g. Solo todos + scratchpads), never in the repo.**
5. **Non-trivial work goes through brainstorm → plan → multi-reviewer → impl** — see [workflows/spec-formalization.md](workflows/spec-formalization.md). Skip only for mechanical / single-file / docs-only / blocker-fix work.
6. **Reviewer agents gate merges.** Code PRs get a Claude/Codex reviewer that runs `/review` AND plan-conformance AND merges itself on CLEAN — see [workflows/review-and-merge.md](workflows/review-and-merge.md). Docs-only PRs merge without a reviewer.
7. **After every merge: cleanup the worktree and remove the harvested delegate process.** Mechanical — do it yourself, don't dispatch. See [workflows/hygiene.md](workflows/hygiene.md).
8. **Every brief gets the Pattern C reporting preamble** (see [references/reporting-contract.md](references/reporting-contract.md)). Prefer push (Pattern C) for worker→orchestrator wakeup. Timers allowed as a safety net for **external** state (CI, deploy, network polling), but never as a substitute for push when push is available.
9. **Every brief gets the project north star** injected by the dispatch.md templates — agents do not derive direction, they obey it. Source: `docs/NORTH_STAR.md` (with MemPalace mirror). If missing, the boot step prompts once; never auto-derive. See the `north-star` skill.

## Decision tree

```
Task arrives
├─ Mechanical (rename / single-file / typo / docs touch-up)
│    └─ Optional: edit yourself OR one-shot delegate. No spec workflow.
├─ Bug fix matching a specific reviewer blocker (the blocker IS the spec)
│    └─ Dispatch impl agent with brief = blocker text. No re-review.
├─ Docs-only (prose `.md` / skill update / README)
│    └─ Edit or one-shot delegate. Squash-merge directly. No reviewer.
└─ Non-trivial feature / multi-file / public-API change / contract change
     └─ Brainstorm (≥2 voices) → Writing-plans → Multi-reviewer panel
        → Synthesize → Dispatch impl(s) → Review+merge → Cleanup
```

## Default behaviour

1. **Read, don't write.** Reads, greps, git log, and spec synthesis stay with you. File-modifying work — coding, tests, refactors — is dispatched.
2. **One process per task.** Focused scope, commit discipline, explicit deliverable (commit/PR/summary). Built-in in-process subagents (Claude Code Task/Agent) are allowed for **read-only research** that doesn't need isolation. Never use them for code-modifying delegates — those need their own worktree and must be dispatched out-of-process.
3. **Isolated workspace per coding delegate.** Never share a working tree between parallel coding agents. Isolation is the rule; the mechanism is your choice.
4. **Capture output in durable state surfaces, not repo files.** The repo is for shipping artefacts; review reports + working notes live in your chosen transport's state surface (e.g. Solo).
5. **Default to dispatch, not to ask.** When the next-wave work has enough context to run, fire it — do not idle while a prior wave completes. Parallel tracks that share no state should launch concurrently. Only ask the user when scope is genuinely ambiguous or a decision changes direction (product scope, SemVer strategy, locale priority).

### When the orchestrator may edit files directly

- Spec writing/revision when context is already loaded (prose iteration > delegation overhead).
- Trivial doc updates (typo, link, status label) not worth a PR round-trip.
- One-line fixes blocking a delegate.
- Anything the user explicitly asks you to do yourself.

Outside these, push to a delegate.

## Agent selection

| Agent | When to pick |
|---|---|
| **Codex** | Default for coding. Rust/TS/Go impl, tests, refactors, mechanical changes. |
| **Claude** | Coding mixed with heavy spec reading / synthesis. Any task that needs a Claude Code slash command or skill (`/review`, `/qa`, `/brainstorming`, `/audit`, `/plan-*-review`, `/investigate`, `/cleanup`, `/document-release`). Opus 4.7 by default. |
| **Gemini** | **Second-opinion & Dissent.** Adversarial reviews, fresh eyes. Standard 3rd voice for high-stakes plan reviews. |

Resolve specific IDs/names at dispatch time via your transport's discovery tools. Never hardcode.

Hard rules:
- Never use Gemini for implementation.
- Codex is default coding voice.
- When a spec is ready, have it reviewed by ≥2 agent families in parallel before any impl.

## Workflow entry points

| Surface | Entry point |
|---|---|
| Non-trivial feature spec | [workflows/spec-formalization.md](workflows/spec-formalization.md) — brainstorm → plan → counselors → synthesize |
| Code PR review & merge | [workflows/review-and-merge.md](workflows/review-and-merge.md) — reviewer routing, brief template, blocker loop |
| Dispatch a coding/slash-command delegate | [workflows/dispatch.md](workflows/dispatch.md) — full step sequence + brief templates |
| Periodic & post-merge hygiene | [workflows/hygiene.md](workflows/hygiene.md) — worktree purge, `/cleanup`, `/document-release` |

## Reporting & monitoring — Pattern C preferred

Workers push terminal-event signals to the orchestrator only when they finish or block. State reporting contract generally involves the worker writing a durable note and pushing a sentinel to the orchestrator. See [references/reporting-contract.md](references/reporting-contract.md) for the role discipline and [references/transports/solo.md](references/transports/solo.md) for Solo-specific tool calls.

Prefer push (Pattern C) for worker→orchestrator wakeup. Timers allowed as a safety net for **external** state (CI, deploy, network polling). Never use timers as a substitute for push when push is available.

When a sentinel arrives: read durable state → verify artifact (PR/commit/verdict) → harvest the worker process.

Full sentinel vocabulary: [references/reporting-contract.md](references/reporting-contract.md).

## State surfaces

State can live in scratchpads, todos, durable memory, or the repo. Each has one job; don't double-write. See [references/state-surfaces.md](references/state-surfaces.md) for Solo-flavored mapping.

## Tooling preference

Prefer `lean-ctx`/`lctx` for shell, search, and read commands that match its compression rules. If a hook blocks a command and suggests an exact `lean-ctx -c "..."` rerun, use that rerun before falling back to plain shell.

## Anti-patterns

Accumulated lessons live in [references/anti-patterns.md](references/anti-patterns.md). Read once at session start.

## Quick invocation

When the user types `/orchestrator-mode`:
1. Acknowledge mode switch briefly.
2. **Load the project north star.** Run the `north-star` skill's `consult.md` `load(<project>)` procedure. Three outcomes:
   - **Exists, no drift:** Acknowledge with one line. Do not re-ask the user about scope or direction.
   - **Exists, drift:** Print the diff. Ask: "Reconcile via `/north-star` refresh, or pick one for this session?"
   - **Missing:** Ask once — "No north star for this project. Derive one now via `/north-star`, skip for this session, or skip permanently?" Respect the answer; never auto-derive.
3. Confirm transport is reachable (e.g. `solo doctor` for Solo). If unreachable, STOP and report — do not fall back to in-process coding delegates.
4. Audit in-flight delegate processes via your transport's list tool + git log + open PR list.
5. Clarify next goal if not stated. Skip this step when the loaded north star already disambiguates next-wave direction.
6. From here: default to delegation. Edit files only under the exceptions above. Every delegate brief auto-injects the north star via the [workflows/dispatch.md](workflows/dispatch.md) brief templates.
