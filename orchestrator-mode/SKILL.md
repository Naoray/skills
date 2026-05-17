---
name: orchestrator-mode
description: Use when the user says `/orchestrator-mode`, asks you to coordinate agents, or gives large multi-phase work needing parallel delegation, reviews, PRs, scratchpads, or handoffs. Inputs - project goal, repo context, Solo agents/processes, branch/worktree constraints, locked user decisions. Do not use for a direct small edit, a normal code review, or single-agent implementation; use focused coding/review skills instead. Produces delegation plan, agent briefs, monitoring protocol, review/merge routing, state hygiene rules. Escalate on unclear scope, product direction, merge authority, destructive cleanup, or tool availability. Delegates are Solo processes: spawn via Solo MCP when inside Solo, or via `solo` CLI when outside Solo — never the in-process Task/Agent tool.
---

# Orchestrator Mode

**Evidence tier**: P
**Basis**: Practitioner-backed multi-agent software coordination, code review gating, worktree isolation, and durable state hygiene.
**Source IDs**: Solo CLI + MCP workflow conventions; Anvil worktree workflow; Naoray/skills orchestrator-mode prior art.
**Reviewed**: 2026-05-15

You are the coordinator. Your primary output is delegation — not file edits.

## Delegation transport — inside Solo use MCP spawn, outside Solo use CLI spawn (HARD RULE)

**FORBIDDEN:** Claude Code's built-in `Task` tool, `Agent` tool, or any `subagent_type=...` dispatch. These spawn in-process subagents that share your context, can't be Pattern-C monitored, and break worktree isolation. They are NOT the delegates this skill refers to.

**REQUIRED — choose transport by where the orchestrator is running.**

- **Inside Solo:** spawn, brief, and close delegates with Solo MCP tools (`mcp__solo__spawn_process`, `mcp__solo__send_input`, `mcp__solo__close_process`/stop equivalent). You are already a Solo process, so MCP preserves parent/child routing and Pattern C callbacks.
- **Outside Solo:** spawn, list, stop, todo, scratchpad, and project operations go through the `solo` CLI invoked via `ctx_shell` (or `Bash`). CLI output passes through lean-ctx's compression patterns and works when Solo MCP tools are unavailable.

Outside-Solo CLI examples:

```bash
solo processes list --project-id <id> [--json]
solo processes spawn --project-id <id> --kind agent --agent-tool-id <id> --name <slug> --arg "<brief>"
solo processes get <pid> [--json]
solo processes stop <pid>
solo todos list --project-id <id>
solo todos create --project-id <id> --title "<t>" --body "<b>"
solo scratchpads list --project-id <id> --query <q>
solo scratchpads read <id> --project-id <id> --mode content
solo scratchpads create --project-id <id> --name <slug> --content <text>
solo scratchpads append <id> --project-id <id> --content <text>
```

Add `--json` only when you need structured parsing — human-output compresses better with lean-ctx.

**MCP-required operations while inside Solo:**

| Operation | Tool | Why kept |
|---|---|---|
| Spawn delegate | `mcp__solo__spawn_process` | Required inside Solo so the delegate is a proper Solo child. |
| Resolve agent_tool_id | `mcp__solo__list_agent_tools` | IDs rotate per Solo restart; use MCP when available. |
| Orchestrator pid | `mcp__solo__whoami` | Needed for Pattern C `send_input` target. |
| Push to a process (briefs, Pattern C events) | `mcp__solo__send_input` | Pattern C push is non-negotiable. |
| Close delegate | `mcp__solo__close_process` or stop equivalent | Keep lifecycle tied to the Solo parent when inside Solo. |

Transport check: if `mcp__solo__whoami` succeeds or Solo env/session identity is present, treat the orchestrator as inside Solo and spawn via MCP. If Solo MCP tools are unavailable but `solo doctor` works, treat the orchestrator as outside Solo and spawn via CLI. If neither path works, stop and report tool unavailability. Never fall back to the in-process `Task`/`Agent`/`subagent_type` tools.

## TL;DR — operating summary

1. **Read, don't write.** Coding/refactor/test work goes to a delegate. You scope, brief, monitor, evaluate.
2. **Default delegate = Codex** for coding, **Claude** for slash-commands & spec-heavy work, **Gemini** for adversarial second-opinions only, **Cursor** for plan-review fourth voice only. All dispatched as Solo processes: MCP spawn inside Solo, CLI spawn outside Solo.
3. **Each coding delegate works in its own anvil worktree.** The delegate sets it up via the `anvil-agent` skill — you do not pre-create worktrees.
4. **Feedback lives in solo todos + scratchpads + MemPalace, never in the repo.**
5. **Non-trivial work goes through brainstorm → plan → multi-reviewer → impl** — see [workflows/spec-formalization.md](workflows/spec-formalization.md). Skip only for mechanical / single-file / docs-only / blocker-fix work.
6. **Reviewer agents gate merges.** Code PRs get a Claude/Codex reviewer that runs `/review` AND plan-conformance AND merges itself on CLEAN — see [workflows/review-and-merge.md](workflows/review-and-merge.md). Docs-only PRs merge without a reviewer.
7. **After every merge: cleanup the worktree.** Mechanical — do it yourself, don't dispatch. See [workflows/hygiene.md](workflows/hygiene.md).
8. **Every brief gets the Pattern C reporting preamble** (see [references/reporting-contract.md](references/reporting-contract.md)). Pattern C is mandatory. Workers push terminal events; you don't poll. Pattern A timers and ScheduleWakeup fallbacks are forbidden.
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
2. **One solo process per task.** Focused scope, commit discipline, explicit deliverable (commit/PR/scratchpad summary). The process is a Solo child spawned via Solo MCP when inside Solo or `solo processes spawn` when outside Solo, **never** an in-process Claude Code subagent (`Task` / `Agent` / `subagent_type`).
3. **Anvil worktree per coding delegate.** Never share a working tree between parallel coding agents. Claude's built-in `isolation:"worktree"` is forbidden by global CLAUDE.md — delegates use the `anvil-agent` skill instead.
4. **Capture output in solo todos + scratchpads, not repo files.** The repo is for shipping artefacts; review reports + working notes live in Solo.
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
| **Claude** | Coding mixed with heavy spec reading / synthesis. Any task that needs a Claude Code slash command or skill (`/review`, `/qa`, `/brainstorming`, `/counselors`, `/audit`, `/plan-*-review`, `/investigate`, `/cleanup`, `/document-release`). Opus 4.7 by default. |
| **Gemini** | **Second-opinion only.** Adversarial reviews, fresh eyes. Unreliable for single-voice tasks in this env. |
| **Cursor** | **Multi-reviewer panel only.** Fourth voice on high-stakes plan reviews. Different IDE/distribution perspective. Never for primary impl. |

Resolve names → Solo `agent_tool_id` at dispatch time via `mcp__solo__list_agent_tools` (MCP — no CLI equivalent). IDs are environment-specific; do not hardcode.

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

## Reporting & monitoring — Pattern C only

Worker invokes `solo-orchestration`, writes durable notes to a `done/<task-slug>` scratchpad (via `solo scratchpads create/append` CLI), and calls `mcp__solo__send_input(orchestrator_pid, "<SENTINEL>: ...")` only on terminal events: done, blocked, merged, or review verdict. `send_input` stays MCP — no CLI equivalent.

No timers. No idle polling. No ScheduleWakeup. Idle transitions lie when a worker finishes reading a brief or waits for input; Pattern C wakes the orchestrator only when the worker declares an event.

When a sentinel arrives: read scratchpad → verify artifact (PR/commit/verdict/todo) → close the worker immediately.

Full preamble (paste-into-every-brief) and sentinel vocabulary: [references/reporting-contract.md](references/reporting-contract.md).

## State surfaces

Four places state can live — each has one job, don't double-write. Quick rule: **scratchpad** for next-step working artefacts, **solo todo** for actionable work, **MemPalace drawer** for durable cross-session knowledge, **repo `docs/`** for shipping artefacts. Full table, naming convention, and lifecycle: [references/state-surfaces.md](references/state-surfaces.md).

## Tooling preference

Prefer `lean-ctx`/`lctx` for shell, search, read commands that match its compression rules (`git`, `rg`, `sed`, `ls`, **`solo`**). If a hook blocks a command and suggests an exact `lean-ctx -c "..."` rerun, use that rerun before falling back to plain shell. Note: lean-ctx file-read tools refuse paths outside the project root — for `~/.claude/`, `~/.scribe/`, `~/.mempalace/` etc. use native `Read` or `ctx_shell`.

## Anti-patterns

Accumulated lessons live in [references/anti-patterns.md](references/anti-patterns.md). Read once at session start.

## Quick invocation

When the user types `/orchestrator-mode`:
1. Acknowledge mode switch briefly.
2. **Load the project north star.** Run the `north-star` skill's `consult.md` `load(<project>)` procedure — checks `docs/NORTH_STAR.md` and the MemPalace drawer in `wing=<project>`. Three outcomes:
   - **Exists, no drift:** Acknowledge with one line — `North star loaded: <mission>. Acting autonomously per principles.` Do not re-ask the user about scope or direction; the artefact answers those.
   - **Exists, drift:** Print the diff. Ask: "File and drawer disagree on <sections>. Reconcile via `/north-star` refresh, or pick one for this session?"
   - **Missing:** Ask once — "No north star for this project. Derive one now via `/north-star`, skip for this session, or skip permanently?" Respect the answer; never auto-derive.
3. Confirm Solo is reachable: `solo doctor` + `mcp__solo__whoami` + `mcp__solo__list_agent_tools`. `whoami` and `list_agent_tools` stay MCP — no CLI equivalent. If Solo is unreachable, STOP and report — do not fall back to the in-process `Task`/`Agent` tool.
4. Audit in-flight delegate processes via `ctx_shell`: `solo processes list --project-id <id>` + `git log` + open PR list.
5. Clarify next goal if not stated. Skip this step when the loaded north star already disambiguates next-wave direction.
6. From here: default to Solo delegation. If inside Solo, spawn/brief/close via Solo MCP. If outside Solo, spawn via `solo` CLI and use MCP only if the tools are available for `list_agent_tools` / `whoami` / `send_input`. Edit files only under the exceptions above. The `Task`/`Agent`/`subagent_type` tools are forbidden in this mode. Every delegate brief auto-injects the north star via the [workflows/dispatch.md](workflows/dispatch.md) brief templates — agents inherit the same compass.
