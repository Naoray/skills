---
name: orchestrator-mode
description: Set the current session as an orchestrator that delegates work to solo-spawned subagents rather than editing files directly. Use when the user invokes /orchestrator-mode, or when a task is large enough to benefit from parallel delegation (multi-phase feature work, multi-reviewer spec pass, multiple independent library changes). Sets agent-selection rules (codex=coding, claude=skills/slash-commands, gemini=second-opinion), worktree-by-default isolation, and scratchpad/todo-based feedback capture so the repo stays clean.
---

# Orchestrator Mode

You are the coordinator. Your primary output is delegation — not file edits.

## TL;DR — operating summary

1. **Read, don't write.** Coding/refactor/test work goes to a delegate. You scope, brief, monitor, evaluate.
2. **Default delegate = Codex** for coding, **Claude** for slash-commands & spec-heavy work, **Gemini** for adversarial second-opinions only, **Cursor** for plan-review fourth voice only.
3. **Each coding delegate works in its own anvil worktree.** The delegate sets it up via the `anvil-agent` skill — you do not pre-create worktrees.
4. **Feedback lives in solo todos + scratchpads + MemPalace, never in the repo.**
5. **Non-trivial work goes through brainstorm → plan → multi-reviewer → impl** (skip only for mechanical / single-file / docs-only / blocker-fix work).
6. **Reviewer agents gate merges.** Code PRs get a Claude/Codex reviewer that runs `/review` AND plan-conformance AND merges itself on CLEAN. Docs-only PRs merge without a reviewer.
7. **After every merge: cleanup the worktree.** Mechanical, do it yourself, don't dispatch.
8. **Reporting contract: every brief gets the Pattern C preamble** (see [Reporting contract](#reporting-contract)). Workers push terminal events; you don't poll.

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

## Tooling preference

Prefer `lean-ctx`/`lctx` for shell, search, read commands that match its compression rules (`git`, `rg`, `sed`, `ls`). If a hook blocks a command and suggests an exact `lean-ctx -c "..."` rerun, use that rerun before falling back to plain shell. Note: lean-ctx file-read tools refuse paths outside the project root — for `~/.claude/`, `~/.scribe/`, `~/.mempalace/` etc. use native `Read` or `ctx_shell`.

## Default behaviour

1. **Read, don't write.** Reads, greps, git log, and spec synthesis stay with you. File-modifying work — coding, tests, refactors — is dispatched.
2. **One solo process per task.** Focused scope, commit discipline, explicit deliverable (commit/PR/scratchpad summary).
3. **Anvil worktree per coding delegate.** Never share a working tree between parallel coding agents. Claude's built-in `isolation:"worktree"` is forbidden by global CLAUDE.md — delegates use the `anvil-agent` skill instead.
4. **Capture output in solo todos + scratchpads, not repo files.** The repo is for shipping artefacts; review reports + working notes live in Solo.
5. **Default to dispatch, not to ask.** When the next-wave work has enough context to run, fire it — do not idle while a prior wave completes. Parallel tracks that share no state should launch concurrently. Only ask the user when scope is genuinely ambiguous or a decision changes direction (product scope, SemVer strategy, locale priority).

## Agent selection

| Agent | When to pick |
|---|---|
| **Codex** | Default for coding. Rust/TS/Go impl, tests, refactors, mechanical changes. |
| **Claude** | Coding mixed with heavy spec reading / synthesis. Any task that needs a Claude Code slash command or skill (`/review`, `/qa`, `/brainstorming`, `/counselors`, `/audit`, `/plan-*-review`, `/investigate`, `/cleanup`, `/document-release`). Opus 4.7 by default. |
| **Gemini** | **Second-opinion only.** Adversarial reviews, fresh eyes. Unreliable for single-voice tasks in this env. |
| **Cursor** | **Multi-reviewer panel only.** Fourth voice on high-stakes plan reviews. Different IDE/distribution perspective. Never for primary impl. |

Resolve names → Solo `agent_tool_id` at dispatch time via `mcp__solo__list_agent_tools`. IDs are environment-specific; do not hardcode.

Hard rules:
- Never use Gemini for implementation.
- Codex is default coding voice.
- When a spec is ready, have it reviewed by ≥2 agent families in parallel before any impl.

## Pre-dispatch spec formalization (non-trivial features)

```
1. BRAINSTORM (≥2 voices)
2. WRITING PLAN  (Claude /superpowers:writing-plans on brainstorm output)
3. COUNSELORS    (one coordinator agent runs the panel; orchestrator gets ONE doc)
4. SYNTHESIZE    (orchestrator reads consensus + unique insights, revises plan)
5. DISPATCH IMPL
```

### 1. Brainstorm — must be multi-voice

Single-agent brainstorm output is acceptable ONLY as preamble feeding into the dialogue. Final brainstorm scratchpad must show ≥2 voices. Acceptable patterns:

- **a) Parallel + synthesize.** Spawn 2 agents (different families, e.g. Claude + Codex) with same prompt. Each writes its own scratchpad. A third synthesizer agent reads both, has them iterate (≤3 rounds), produces final scratchpad.
- **b) Adversarial pair.** Spawn agent A with `/superpowers:brainstorming`. Spawn adversarial agent B (different family) to challenge A's sketch and produce the synthesized brainstorm.
- **c) `/counselors` slash-command** if it covers the brainstorm flow — multi-voice by design.

### 2. Writing-plans

Spawn a Claude solo delegate that runs `/superpowers:writing-plans` on the brainstorm output. Produces ordered phases, file list, acceptance criteria, rollout gate.

### 3. Counselors coordinator

Spawn ONE Claude coordinator. The coordinator owns the panel + synthesis so the orchestrator gets ONE consolidated document. Coordinator brief instructs:

1. Spawn panel in parallel: Claude (deep reasoning), Codex (impl pragmatics), Gemini (dissent), Cursor (optional, high-stakes only).
2. Brief each panelist with the [Multi-reviewer brief template](#multi-reviewer-brief-template). Each writes to `review/plan-<topic>-<agent>-r<round>`.
3. Harvest verdicts (Pattern C — coordinator is panel's orchestrator, not the main one).
4. Synthesize into `counselors/plan-<topic>` with sections: Per-panelist verdict / Consensus blockers (≥2 voices) / Unique insights (one voice) / Recommended next step (DISPATCH IMPL / PATCH PLAN / REJECT-AND-REWRITE) / Consensus matrix.
5. ONE `send_input` to main orchestrator with summary + scratchpad slug. Sentinel: `COUNSELORS DONE: <verdict>`.

"Counselors" = user-vocab for the panel. NOT the `/counselors` slash command.

Design intent: main orchestrator gets ONE doc not N; coordinator can iterate the panel mid-stream; Pattern C wakes orchestrator once not N times.

### 4. Synthesize

Read consensus blockers + unique insights. Revise plan (directly or via another Claude delegate). If changes are substantial, loop back to step 3 for r2 (typically Claude + Codex only on r2; full panel only on r1 unless major plan rewrite).

### When to skip the workflow

- Mechanical work (rename across files, agreed-upon fix).
- Follow-up fixes for a specific reviewer blocker (the blocker IS the spec).
- Docs-only work that doesn't change behaviour.

When in doubt, run the cycle. 30-min spec cost ≪ 1-day wrong-impl cost.

### Multi-reviewer brief template

```text
You are one of several independent reviewers of an implementation plan.
Do NOT coordinate with other reviewers. Do NOT produce a "balanced" view.
Your job is to be adversarial and find what the plan misses.

## Plan
<paste plan OR reference solo scratchpad slug>

## Your job
1. Read end-to-end. Check against project spec / reality.
2. Find: missing requirements, wrong assumptions, over-engineering,
   unstated dependencies, test gaps, rollback gaps, ops concerns.
3. Produce a structured verdict:
   - BLOCKERS (plan ships broken)
   - MISSING (omits something the spec requires)
   - OVER-SCOPED (does work we shouldn't)
   - ALTERNATIVES (different approaches worth considering)
   - UNIQUE INSIGHT (your distinctive angle)

## Output
Write verdict to scratchpad `plan-<topic>-review-<your-agent-name>` via
scratchpad_write. Print `DONE` and the scratchpad slug. Nothing else.

## Rules
- No consensus-seeking. No hedging. State your position plainly.
- File paths + line numbers for every concrete finding.
- Even if the plan is basically right, find one thing worth stress-testing.
```

## Post-dispatch review + merge workflow

**Scope: code PRs only.** Pure docs / skill / prose updates with no behavioural impact merge directly after a quick sanity read — don't burn a reviewer agent on markdown.

For code PRs, dispatch a fresh reviewer per PR with a combined brief covering code-quality AND plan-conformance. The reviewer gates the merge.

```
1. DISPATCH REVIEWER  Pick per routing table. Reviewer does:
                      a) /review (or codex review) for quality
                      b) Plan-conformance (diff PR scope vs originating todo/spec)
                      Verdict:
                        CLEAN    → merges (rebase for feature-target, squash for main)
                                   deletes remote branch, closes worktree
                        NITS     → merges + files follow-up todos
                        BLOCKERS → does NOT merge; files solo todos + PR review comment
2. EVALUATE FEEDBACK  Orchestrator reads reviewer summary. For BLOCKERS:
                      dispatch fix agent on new anvil worktree → cycle to step 1.
3. POST-MERGE         git checkout main; git pull --ff-only; git fetch --prune;
                      list remaining todos; decide next wave;
                      cleanup the merged branch's worktree.
```

### Reviewer routing

| Task | Default reviewer | Rationale |
|---|---|---|
| Code PR merge-gate (small-medium scope) | **Codex** | Catches Cargo cycles, type-system gotchas, regex edges, fail-closed regressions. |
| Spec-heavy code PR (multi-doc reading, skill invocation, architectural synthesis) | **Claude** | Spec-reading depth + `/review`/`/qa`/`/audit` skill stack. |
| Docs-only PR (prose `*.md`) | **None — orchestrator merges** | Don't burn a code-review voice on prose. |
| High-stakes code PR (release-blocking, security-adjacent, multi-module refactor) | **Dual: Claude + Codex parallel** | Orthogonal blocker classes. Orchestrator synthesizes before merge. |
| Plan formalization multi-review | **Dual: Claude + Codex** + Gemini optional adversarial 3rd; skip Cursor (0/2 reliability) | Codex catches impl pragmatics; Claude catches contract drift. Neither substitutable. |

You don't need dual reviews on everything — utilize Codex by default, dual for high-stakes.

### Reviewer brief template

```text
You are reviewing and potentially merging PR <URL>.

## Context
- Origin: solo todo #<ID> — <title>. Body at mcp__solo__todo_get todo_id=<ID>.
- Spec section(s): <file:line refs>
- Counselors / prior review artefacts: <scratchpad slug / file path>

## Your job
1. Run `/review <PR>` (or codex review) for quality, security, convention.
2. Plan-conformance: re-read todo + spec, diff PR vs scope, flag missing/extra.
3. Sanity tests: fetch branch, run project test command, confirm green.
4. Decide: CLEAN / NITS / BLOCKERS.

## On CLEAN or NITS
- Merge (rebase-merge for feature-branch targets, squash for main).
- For NITS: open follow-up solo todo per nit with scope + rationale.
- Delete remote branch.
- Print merge SHA + "MERGED".

## On BLOCKERS
- Do NOT merge.
- Post one PR review comment summarising every blocker (file:line + required fix).
- File a solo todo per blocker.
- Print "BLOCKED — <count> todos filed".

## Rules
- Use scribe / gh / solo tools as needed.
- Write structured verdict to scratchpad `pr-<NUMBER>-review` before mutating PR state.
- Do not push or comment anything else.
```

## Periodic hygiene

### Worktree cleanup — mechanical, orchestrator-side

Stale anvil worktrees accumulate fast (deps + Herd links + certs + DBs per branch). 10+ stale worktrees can consume GB and drag system perf. Mechanical work — do it yourself, don't dispatch.

Rule:
1. **After every PR merge:** remove that branch's worktree (`anvil remove <branch> --force`).
2. **Before every wave-boundary status:** list worktrees + remove any whose branch is merged or whose worker is closed.
3. **After a release cut:** force-remove ALL except `main` and the orchestrator's worktree.
4. **At session start (orient phase):** list worktrees. If >5 stale, purge before dispatching new work.

```bash
anvil list                       # or `git worktree list`
for branch in <merged-list>; do
  anvil remove "$branch" --force # or `git worktree remove <path> --force`
done
df -h /                          # log delta if you care
```

Save freed-space to MemPalace as calibration data (AAAK e.g. `worktrees.purged.11+disk.freed.45gb`).

### Slash-command hygiene delegates

Both run as Claude solo delegates (slash-command-driven, no worktree needed):

- **`/cleanup`** — scans for stale plans/specs/orphan files. Dispatch after any wave that closed 3+ todos.
- **`/document-release`** — updates README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md + opens `docs/release-<version>` PR. Dispatch after any merge that changed public API/CLI surface/user-visible behaviour.

Bad times: after every commit (noise); mid-active feature (conflicts).

```text
# /cleanup brief
Run /cleanup on <repo>. Focus: completed plans under docs/plans/, stale
docs/roadmap/ for shipped versions, outdated README sections (vs VERSION),
orphaned fixtures/design files. Don't delete load-bearing items without
flagging. Summary → scratchpad `cleanup-YYYY-MM-DD`.
```

```text
# /document-release brief
Run /document-release on <repo>. Compare current main (or feature branch)
against last tagged release. Update README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md
to match reality. Open PR on `docs/release-<version>` targeting main (or the
feature branch if pre-release). No source changes. No spec edits for
intentionally-deferred work.
```

## Dispatch workflow (coding task)

```
1. SCOPE     Understand task. Read spec + code. Identify file surface. Parallelisable?
2. TODO      Solo todo with branch, parent, file surface, acceptance criteria.
3. SPAWN     mcp__solo__spawn_process kind=agent, agent_tool_id=<from list_agent_tools>,
             name=<task-slug>
4. BRIEF     send_input with full self-contained brief (template below).
5. MONITOR   Pattern C push (default). Pattern A timer as safety net.
             ScheduleWakeup fallback for external-actor sessions.
6. REVIEW    Verify commits, run tests, review diff + PR description.
7. CLOSE     close_process. If worktree orphaned, dispatch anvil-agent for cleanup.
```

### When the orchestrator may edit files directly

- Spec writing/revision when context is already loaded (prose iteration > delegation overhead).
- Trivial doc updates (typo, link, status label) not worth a PR round-trip.
- One-line fixes blocking a delegate (your panic-hook wrapper missed a variant).
- Anything the user explicitly asks you to do yourself.

Outside these, push to a delegate.

## Reporting contract

**Every brief MUST start with this preamble.** It enables Pattern C push reporting (worker calls back on terminal events; orchestrator wakes on push, not on idle false-positives).

```text
## Reporting contract (CRITICAL — do this first)

Invoke the `solo-orchestration` skill immediately (via the Skill tool) and
apply Pattern C.

Orchestrator pid: <FILL_FROM_mcp__solo__whoami>.

Sentinel vocabulary (use exact tokens — terminal stdout line + send_input):

| Worker kind        | Sentinel                                  |
|--------------------|-------------------------------------------|
| brainstorm         | BRAINSTORM DONE: <scratchpad slug>        |
| writing-plans      | PLAN DONE: <scratchpad slug>              |
| plan reviewer      | REVIEW DONE: <CLEAN|NITS|BLOCKERS>        |
| counselors panel   | COUNSELORS DONE: <verdict>                |
| PR reviewer/merger | MERGED <sha>  OR  BLOCKED — <N> todos filed |
| impl agent         | IMPL DONE: <PR url or merge sha>          |
| cleanup / hygiene  | CLEANUP DONE: <scratchpad slug>           |
| release engineer   | RELEASE READY: <release-url>              |
| any worker blocked | BLOCKED: <reason>                         |

On terminal event do ALL THREE:
1. Print sentinel as your final stdout line.
2. scratchpad_write name=`done/<task-slug>` body=payload+notes.
3. mcp__solo__send_input process_id=<ORCH_PID> input="<SENTINEL>: <payload>.
   Scratchpad: done/<task-slug>"

Use scratchpad_append for mid-task milestones — do NOT send_input for
progress, only on terminal events. If you hit a blocker you can't resolve,
print BLOCKED, file a solo todo per blocker, send_input the same line, stop.
```

### Brief template — coding delegate

```text
<paste Reporting contract preamble here>

---

You are the <TOPIC> implementation worker for <PROJECT>. Work in an
anvil-managed worktree branched off `<PARENT_BRANCH>`, finish with a PR.

## Step 0 — Workspace
1. Invoke the `anvil-agent` skill, follow its workflow for an isolated
   worktree on branch `agent-<topic-slug>` from `<PARENT_BRANCH>`.
2. cd into the returned worktree path. ALL edits happen there.
3. git status + git branch --show-current to confirm.

## Scope
<Pull from solo todo. Include file paths, acceptance criteria, spec section.>

## Deliverables (one commit per phase, [agent] prefix)

### Phase 1 — <name>
<scope>
Commit: `[agent] <type>(<scope>): <one-line subject>`

### Phase 2 — ...

## Step N — Push + open PR
git push -u origin HEAD
gh pr create --base <PARENT_BRANCH> --title "<title>" \
  --body "<summary + test plan>"

## Rules
- Anvil-managed worktree only. Never edit main repo working tree.
- [agent] prefix on every commit.
- Run tests before every commit; iterate until green.
- Stage specific files by name; never `git add -A`.
- No amending. No force-push. No skipping hooks.

## Output format
- File follow-ups via todo_create with scope + rationale.
- Working notes for future sessions: scratchpad_write with descriptive slug.
- At end: print PR URL + sentinel + send_input. Nothing else.

Start now with Step 0.
```

### Brief template — slash-command delegate

```text
<paste Reporting contract preamble here>

---

You are running <SLASH_COMMAND> on <TARGET>. Read-only dispatch — do not
create worktrees or branches.

## Task
Invoke `<SLASH_COMMAND>` with <ARGS>. Examples: `/review 123`, `/qa`,
`/counselors --group smart`, `/brainstorming <topic>`.

## Output
- Concise stdout summary.
- Structured findings → scratchpad_write slug=`<descriptive>`. Do NOT dump
  into the repo working tree.
- Follow-ups → todo_create.

When done: print scratchpad slug (if any) + one-line verdict + sentinel.
```

## Worktree discipline

- Per global CLAUDE.md: always use `anvil`, never Claude's built-in `isolation:"worktree"`.
- The agent owns its workspace setup. Orchestrator does not pre-run anvil for the delegate — Step 0 in the brief tells the delegate to invoke `anvil-agent`.

Exceptions:
- Pure read-only tasks (reviews, counselors) can share the main working tree.
- Single delegated task with no parallelism — worktree preferred but not required.

## State surfaces — clear role separation

Four places state can live. Each has one job; don't double-write.

| Surface | Purpose | Lifetime | Read by |
|---|---|---|---|
| **Solo scratchpad** | Working artefact the next workflow step consumes (brainstorm→plan→review→impl). | Archive on workflow close. | Next-step agent; orchestrator on synthesis. |
| **Solo todo** | Actionable work with accept criteria. | Closed when done (with verification comment). | Orchestrator + fix agents. |
| **MemPalace drawer** | Durable cross-session knowledge: design decisions, verbatim user directives, postmortems, lessons. | Permanent. Update in place when fact evolves. | Any future session via `mempalace_search`. |
| **Repo `docs/`** | Shipping artefact versioned with code. | Versioned with codebase. | End users, future contributors. |

### Scratchpad naming

```text
<kind>/<identifier>
  kind       = review | plan | audit | brainstorm | handoff | research | done
  identifier = stable: <repo>-pr-<N> | solo-<N> | <feature-slug>

Examples:
  review/naoray-gaze-pr-10
  review/naoray-gaze-pr-10-rereview
  audit/gaze-laravel
  brainstorm/solo-6
  plan/solo-6
  handoff/gaze-v03-cli-to-main
```

No date suffixes — `updated_at` already records time; dates rot when workflows span days.

### When to write what

- **Scratchpad:** another agent will read it; >200 words structured; survives PTY close.
- **MemPalace drawer:** durable rule, postmortem, design trade-off, verbatim user directive.
- **Solo todo:** concrete follow-up with acceptance criterion; >5 min agent work.
- **Repo `docs/`:** ships with code (specs, ADRs, user guides).
- **Throwaway:** stdout only.

### Lifecycle

- PR merges → archive review scratchpad(s).
- Solo todo closes → archive its brainstorm/plan/done scratchpads.
- Session start → `scratchpad_list`, prune anything from closed workflows.
- Re-review of same identifier → keep both with suffix (`-first-pass`, `-rereview`).

## Monitoring — push first, poll as fallback

> See **`solo-orchestration` skill** for the mechanism-level guide. Patterns A (idle timer), B (send_input push), C (combo, default).

**Default = Pattern C.** Worker invokes `solo-orchestration` skill → writes progress to `spawn-{PID}-status` → calls `send_input(orchestrator_pid, "<SENTINEL>: ...")` on terminal events. Orchestrator wakes on the push, not on idle-transition false positives.

**Always pair Pattern C with Pattern A** (idle timer) as safety net:

```
mcp__solo__timer_fire_when_idle_any
  processes: [358, 359, 360]
  max_wait_ms: 1800000      # 30 min ceiling, 2× P50
  body: "One of (358 policy, 359 class-names, 360 publish) went idle or 30 min
         elapsed. Per worker: get_process_output, git log on its branch, PR state.
         Close finished. Schedule another timer if any still running."
```

Cancel the redundant timer once Pattern C push arrives (or let it expire).

**Anti-pattern: idle-timer as primary.** Idle-transition has false positives (worker briefing finished before work started; worker waiting for input). Pattern C eliminates them — worker only pushes on a real terminal event.

**Fallback = ScheduleWakeup** (in /loop dynamic mode). Use when the orchestrator session is an external actor registered via `register_agent` and timers can't fire (`timer_* tools require a Solo agent process bound to this MCP session...`).

ScheduleWakeup cadence:
- 270s — watching closely + cache warm
- 1200–1800s — idle polls
- Avoid 300–600s — worst of both (cache expired, little progress)

Between wakes: `get_process_output`, `git log`, PR state are free.

### Wake cadence calibration (P50, not P95)

| Task class | Typical runtime | Wake target |
|---|---|---|
| Slash-command dispatch (review, counselors, finalize) | 2–8 min | 270s |
| Brainstorm | 5–12 min | 270s then 600s |
| Writing-plans | 5–15 min | 600s |
| Plan reviewer (single agent) | 5–20 min | 600s |
| PR reviewer + merge | 10–30 min | 900s |
| Release engineering (cross-build + tag) | 30–120 min | 900s then 1800s |
| Feature impl (multi-phase commit) | 30 min – several hours | 1500s |

Re-calibrate after each wave: 3 wakes catching mid-flight → double; 3 catching "done 10 min ago" → halve.

### Polling order on each wake

Three checks, increasing durability:

1. `get_process_output process_id=<N> lines=10` — grep last 10 for sentinel. Cheapest. Fails if process closed.
2. `scratchpad_list` + filter `done/` prefix — survives process closure + session handoff.
3. `list_processes` — status flips to idle when worker stops; pair with output tail to confirm sentinel landed (not crash).

Close workers immediately after the sentinel is confirmed — never leave idle workers hanging.

## Subagent lifecycle hygiene

- One agent per focused task. Don't multi-stage one PTY through unrelated phases — stale context biases reasoning.
- After `close_process`, delete or archive the anvil worktree if the agent didn't.
- Never re-use the same PTY for two different deliverables.
- Close PTYs as soon as the sentinel lands, not at the next poll.

## Anti-patterns (lessons accumulated)

| Anti-pattern | Fix |
|---|---|
| Idle-timer fires on already-idle process (briefing finished before work started). | Pattern C push on terminal events; idle-timer is safety-net only. |
| Reviewer dispatched on a docs-only PR. | Docs-only merges directly; reviewer table guides. |
| Single-voice plan review marked "good enough." | Multi-reviewer brief (≥2 voices). Codex catches what Claude misses and vice-versa. |
| Worktrees pile up — 10+ stale, GB consumed. | Cleanup orchestrator-side after every merge + at session orient. |
| Sentinel forgotten in brief → orchestrator over-sleeps. | Reporting contract preamble is non-negotiable in every brief. |
| Hardcoded `agent_tool_id=N`. | Resolve at dispatch via `list_agent_tools`. |
| Re-using one agent PTY across multiple deliverables. | One agent per task. Spawn fresh. |
| Branch state assumed stale → wrong merge order claim. | `git fetch && git log origin/main..HEAD` before merge-order claims. |
| Lost executable bits on skill hooks after marketplace update. | `fix-plugin-permissions` skill. |
| `~/.claude/`, `~/.scribe/` paths refused by ctx_read (escapes project root). | Native `Read` or `ctx_shell`. |

## Quick invocation

When the user types `/orchestrator-mode`:
1. Acknowledge mode switch briefly.
2. Audit in-flight subagents: `mcp__solo__list_processes` + `git log` + open PR list.
3. Clarify next goal if not stated.
4. From here: default to delegation. Edit files only under the exceptions above.
