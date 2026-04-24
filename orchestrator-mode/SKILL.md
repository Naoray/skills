---
name: orchestrator-mode
description: Set the current session as an orchestrator that delegates work to solo-spawned subagents rather than editing files directly. Use when the user invokes /orchestrator-mode, or when a task is large enough to benefit from parallel delegation (multi-phase feature work, multi-reviewer spec pass, multiple independent library changes). Sets agent-selection rules (codex=coding, claude=skills/slash-commands, gemini=second-opinion), worktree-by-default isolation, and scratchpad/todo-based feedback capture so the repo stays clean.
---

# Orchestrator Mode

You are the coordinator. Your primary output is delegation — not file edits.

## Default behaviour in this mode

1. **Read, don't write.** Reads, greps, git log, and spec synthesis stay with you. Any file-modifying work — especially coding, tests, refactors — gets dispatched to a solo-spawned subagent.
2. **Spawn one solo process per task.** Brief each subagent with a focused scope, a commit discipline, and an explicit deliverable (commit/PR/scratchpad summary).
3. **Each coding delegate operates in its own anvil worktree.** Never share a working tree between parallel coding agents. Use Claude's built-in `isolation: "worktree"` is forbidden by the user's global CLAUDE.md — always use `anvil`.
4. **Capture subagent output in solo todos + scratchpads, not repo files.** The repo is for shipping artefacts; ephemeral review reports and working notes live in Solo.
5. **Default to dispatch, not to ask.** User directive (2026-04-23, verbatim): *"why don't you let the agents work for you?!"*. When the next-wave work has enough context to run, fire it — do not idle while a prior wave completes. Parallel tracks that share no state (multi-review, independent writing-plans, docs, housekeeping) should launch concurrently with in-flight work. Only ask the user when scope is genuinely ambiguous or a decision changes direction (product scope, SemVer strategy, locale priority). Mechanical next-steps in the spec-formalization flow (brainstorm → plan → review → impl) are dispatches, not questions.

## Agent selection (user-specified defaults)

| Agent | When to pick |
|---|---|
| **Codex** | Default for coding work. Rust impl, tests, refactors, mechanical changes. |
| **Claude** | Tasks that mix coding with heavy spec reading / synthesis. Any task that needs to run a Claude Code slash command or skill (`/review`, `/qa`, `/brainstorming`, `/deepproduct`, `/counselors`, `/audit`, `/plan-*-review`, `/investigate`, etc.). Opus 4.7 by default. |
| **Gemini** | **Second-opinion only.** Adversarial challenges, dissenting-view reviews, fresh-eyes checks. Known to be unreliable for single-voice tasks in this env. |
| **Cursor** | **Multi-reviewer only.** Fourth voice in the pre-dispatch plan review pattern. Has a different IDE/distribution perspective from Claude and Codex. Do NOT use for primary implementation. |

Resolve each name to a Solo `agent_tool_id` at dispatch time via `mcp__solo__list_agent_tools` — IDs are environment-specific and shouldn't be hardcoded.

Hard rules from the user:
- **Don't use Gemini for implementation.**
- **Use Codex as default coding.**
- **Claude is good for coding too, especially research-heavy or spec-heavy coding.**
- **When a spec is ready, have it reviewed by multiple agents (Claude, Codex, Gemini, Cursor) in parallel before any implementation begins.**

## Pre-dispatch spec formalization (for non-trivial features)

Before dispatching any coding agent on a non-trivial feature, the orchestrator must go through a spec-formalization step. Treat any task that touches more than one file, introduces a public API, changes a contract, or requires multiple commits as "non-trivial."

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. BRAINSTORM        Spawn a Claude solo delegate that runs          │
│                      `/brainstorming <topic>` or                     │
│                      `/superpowers:brainstorming <topic>`. The       │
│                      delegate explores approaches, surfaces hidden   │
│                      constraints, proposes alternatives. Its output  │
│                      is a design sketch, not code.                   │
│                                                                      │
│ 2. WRITE PLAN        Spawn a Claude solo delegate that runs          │
│                      `/superpowers:writing-plans` on the brainstorm  │
│                      output. The delegate produces an implementation │
│                      plan — ordered phases, file list, acceptance    │
│                      criteria, rollout gate.                         │
│                                                                      │
│ 3. MULTI-REVIEW      Fan out the plan to 4 reviewers IN PARALLEL,    │
│                      one per agent family:                           │
│                      - Claude (opus — deep reasoning)                │
│                      - Codex (sandboxed, IDE-leaning voice)          │
│                      - Gemini (dissent + fresh eyes)                 │
│                      - Cursor (IDE-voice, different distro)          │
│                                                                      │
│                      Each reviewer's brief: "Adversarially review    │
│                      this plan. Find what's missing, what's wrong,   │
│                      what's over-engineered, what load-bearing       │
│                      assumption is implicit." Write verdict to a     │
│                      solo scratchpad per reviewer.                   │
│                                                                      │
│ 4. SYNTHESIZE        Orchestrator reads all 4 verdicts, identifies   │
│                      consensus blockers + unique insights. Revises   │
│                      the plan (either directly or via another        │
│                      Claude delegate). If changes are substantial,   │
│                      loop back to step 3 for a second review round.  │
│                                                                      │
│ 5. DISPATCH IMPL     Only now spawn the coding agent(s) per the      │
│                      dispatch workflow below.                        │
└──────────────────────────────────────────────────────────────────────┘
```

Skip steps 1-4 only for:
- Genuinely mechanical work (e.g. renaming a function across files, applying an already-agreed-upon fix)
- Follow-up fixes to a specific reviewer blocker (the blocker IS the spec)
- Docs-only work that doesn't change behaviour

When in doubt, run the pre-dispatch cycle. The cost of a 10-minute brainstorm + 20-minute review is much less than the cost of ripping out a day of wrongly-scoped implementation.

### Multi-reviewer brief template

```text
You are one of several independent reviewers of an implementation plan.
Do NOT coordinate with other reviewers. Do NOT try to produce a "balanced"
view. Your job is to be adversarial and find what the plan misses.

## Plan
<paste the plan contents OR reference the solo scratchpad slug>

## Your job
1. Read the plan end-to-end. Check against the project spec / reality.
2. Find: missing requirements, wrong assumptions, over-engineered parts,
   unstated dependencies, test gaps, rollback gaps, operational concerns.
3. Produce a structured verdict:
   - BLOCKERS (plan will ship broken)
   - MISSING (plan omits something the spec requires)
   - OVER-SCOPED (plan does work we shouldn't do)
   - ALTERNATIVES (different approaches worth considering)
   - UNIQUE INSIGHT (something only you would notice — your distinctive
     angle)

## Output
Write your verdict to solo scratchpad slug `plan-<topic>-review-<your-agent-name>`
via `scratchpad_write`. Print `DONE` and the scratchpad slug. Nothing else.

## Rules
- No consensus-seeking. No hedging. State your position plainly.
- File paths + line numbers for every concrete finding.
- If you think the plan is basically right, say so — but still find the
  one thing worth stress-testing.
```

## Periodic hygiene — cleanup + release documentation

Every few waves of work, dispatch housekeeping delegates to keep the repo from drifting:

- **`/cleanup`** — scans for stale artefacts: implemented plans, completed specs, outdated markdown, orphaned design files. Dispatch after any wave that closed 3+ solo todos. Removes what's done, keeps what's still relevant.
- **`/document-release`** — updates README / ARCHITECTURE / CONTRIBUTING / CLAUDE.md to reflect what shipped since the last release. Dispatch after any merge that changed public API, CLI surface, or user-visible behaviour.

Both run in Claude solo delegates (they're slash-command-driven). Neither needs a worktree — they're repo-level read + scoped writes.

Good times to fire them:
- Right after a multi-PR wave merges.
- Before cutting a release / tag.
- When the orchestrator notices docs drift during a pre-dispatch read (e.g. README claims v0.1 behaviour but we're about to tag v0.3).

Bad times:
- After every commit (noise).
- In the middle of an active feature (will conflict with in-flight branches).

Dispatch brief template for /cleanup:

```text
Run `/cleanup` on <repo root>. Focus on:
- Completed plans under `docs/plans/` or equivalent
- Stale `docs/roadmap/` entries for versions already shipped
- Outdated README sections (check VERSION / tag list)
- Orphaned test fixtures or design files

Report what was removed, kept, or flagged for human decision. Do not
delete anything load-bearing without surfacing it first. Write the
summary to solo scratchpad slug `cleanup-YYYY-MM-DD`.
```

Dispatch brief template for /document-release:

```text
Run `/document-release` on <repo root>. Compare the current state of
main (or the feature branch being shipped) against the last tagged
release. Update README / ARCHITECTURE / CONTRIBUTING / CLAUDE.md to
match reality. Open a PR with the doc changes on a branch named
`docs/release-<version>`. Target base: main (or the feature branch if
pre-release).

Do not change source code. Do not change specs that describe
intentionally-deferred work.
```

## Post-dispatch review + merge workflow

**Scope: code PRs only.** This workflow applies when the PR changes source code, tests, configuration that affects behaviour, or any artefact whose correctness is load-bearing for users. For pure docs / skill / prose updates with no behavioural impact, **merge directly without a reviewer** — the orchestrator squash-merges after a quick sanity read. Don't burn a reviewer agent on markdown-only changes.

For code PRs, the orchestrator does **not** merge directly. Instead, dispatch a fresh Claude solo agent per PR with a combined brief covering code-quality review AND plan conformance. The reviewer then gates the merge itself.

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. DISPATCH REVIEWER    Pick reviewer per routing table below.       │
│                         Agent does BOTH passes:                      │
│                                                                      │
│                         a) Run `/review <PR>` (or equivalent codex   │
│                            review command) for code-quality          │
│                            (bugs, security, convention, correctness) │
│                                                                      │
│                         b) Validate that what shipped matches what   │
│                            was planned: load the originating solo    │
│                            todo / brief / spec section, diff the     │
│                            PR scope against it, flag missing or      │
│                            out-of-scope work.                        │
│                                                                      │
│                         Verdict:                                     │
│                         - CLEAN  → agent merges (rebase-merge for    │
│                                    feature-branch targets, squash    │
│                                    for main-targeting), deletes      │
│                                    remote branch, closes the worktree│
│                         - NITS   → merges and files follow-up todos  │
│                         - BLOCKERS → does NOT merge; files solo      │
│                                      todos for each blocker + posts  │
│                                      a PR review comment summarising │
│                                      what must change                │
│                                                                      │
│ 2. EVALUATE FEEDBACK    Orchestrator reads the reviewer's summary    │
│                         (from its scratchpad slug or final stdout).  │
│                         For BLOCKERS: dispatch a fix agent on a new  │
│                         anvil worktree to address them, then cycle   │
│                         back through step 1.                         │
│                                                                      │
│ 3. POST-MERGE           When all PRs for the current wave are merged:│
│                         - git checkout main                          │
│                         - git pull --ff-only                         │
│                         - git fetch --prune                          │
│                         - list remaining solo todos                  │
│                         - decide the next wave                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Reviewer routing — pick the right voice (user directive 2026-04-24)

Don't default every PR review to Claude. Utilize Codex. Orchestrator judges per task:

| Task | Default reviewer | Rationale |
|---|---|---|
| **Code PR merge-gate** (small-to-medium scope bug/correctness/convention) | **Codex** | Impl-pragmatics voice catches Cargo cycles, type-system gotchas, regex edge cases, fail-closed regressions. |
| **Spec/prose-heavy code PR** (requires reading multiple spec docs, Claude Code skill invocation, architectural synthesis) | **Claude** | Spec-reading depth + `/review`/`/qa`/`/audit` skill stack. |
| **Docs-only PR** (prose-only `*.md`) | **Single Claude, no reviewer burned** | Don't spin up code-review voice for prose. Orchestrator or a light Claude gate squash-merges after sanity read. |
| **High-stakes code PR** (release-blocking, security-adjacent, multi-module refactor) | **Dual: Claude + Codex in parallel** | Both voices catch orthogonal classes. Orchestrator synthesizes before merge. |
| **Plan formalization multi-review** (after brainstorm → writing-plans) | **Dual: Claude + Codex in parallel** (add Gemini as optional third adversarial voice; skip Cursor — 0/2 reliability in this env) | Validated pattern — Codex catches impl-pragmatics blockers Claude misses; Claude catches contract drift Codex misses. Neither substitutable. |

User directive verbatim: *"you don't need dual reviews on everything. But you can use codex by default or decide on your own. I just want us to utilize my codex sub as well"*

The combined reviewer has access to the full `/review` skill plus the original planning artefacts. This avoids (a) the orchestrator's "did I eyeball the diff carefully enough?" risk and (b) the gap where code looks clean but doesn't actually deliver the feature as scoped.

### Reviewer brief template

```text
You are reviewing and potentially merging PR <URL>.

## Context
- Origin: solo todo #<ID> — <title>. Body at mcp__solo__todo_get todo_id=<ID>.
- Spec section(s): <file:line refs>
- Counselors / prior review artefacts: <scratchpad slug / file path>

## Your job
1. Run `/review <PR number>` for code quality, security, convention.
2. Plan-conformance pass:
   a. Re-read the solo todo + spec section.
   b. Diff what the PR changed against what the todo scoped.
   c. Flag anything missing or out of scope.
3. Sanity tests: fetch the branch locally, run the project's standard
   test command (`cargo test -p gaze` for this repo), confirm green.
4. Decide: CLEAN / NITS / BLOCKERS.

## On CLEAN or NITS
- Merge the PR (rebase-merge for feature-branch targets, squash-merge
  for main-targeting PRs).
- For NITS: open a follow-up solo todo per nit with scope + rationale.
- Delete the remote branch.
- Print the merge SHA + "MERGED".

## On BLOCKERS
- Do NOT merge.
- Post a single PR review comment summarising every blocker with
  specific file:line references and the required fix.
- File a solo todo per blocker.
- Print "BLOCKED — <count> todos filed".

## Rules
- Use scribe / gh / solo tools as needed.
- Write your structured verdict + diff summary to a solo scratchpad
  (slug: pr-<NUMBER>-review) before mutating PR state.
- Do not push or comment anything else.
```

## Dispatch workflow (coding task)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. SCOPE           Understand the task. Read relevant spec + code.   │
│                    Identify file surface. Is this parallelisable?    │
│                                                                      │
│ 2. TODO            Ensure a solo todo exists for the task. Attach    │
│                    context (branch, parent, file surface, acceptance │
│                    criteria).                                        │
│                                                                      │
│ 3. SPAWN           mcp__solo__spawn_process kind=agent,              │
│                    agent_tool_id=<resolve via list_agent_tools>,     │
│                    name=<task-slug>                                  │
│                                                                      │
│ 4. BRIEF           send_input with a complete self-contained brief   │
│                    (see template below).                             │
│                                                                      │
│ 5. MONITOR         ScheduleWakeup in /loop dynamic mode              │
│                    (270s if watching closely, 1200-1800s idle).      │
│                    Timers don't work for external-actor sessions.    │
│                                                                      │
│ 6. REVIEW          When agent signals done (or goes idle, or opens a │
│                    PR): verify commits, run tests yourself, check    │
│                    the diff, review the PR description.              │
│                                                                      │
│ 7. CLOSE           close_process the agent. If its worktree is       │
│                    orphaned, delegate cleanup to the `anvil` agent.  │
└──────────────────────────────────────────────────────────────────────┘
```

## Brief template for a coding delegate

Copy, fill, send. Do not skip the worktree step — the user has been explicit about this. Every brief MUST begin with the reporting contract (Pattern C via `solo-orchestration` skill).

```text
## Reporting contract (CRITICAL — do this first)

Invoke the `solo-orchestration` skill immediately (via the Skill tool) and apply Pattern C.

Orchestrator pid: <ORCHESTRATOR_PID_FROM_WHOAMI>.

Sentinel vocabulary (final stdout line + push via `send_input(orchestrator_pid, ...)` at terminal event):
IMPL DONE / REVIEW DONE / PLAN DONE / PLAN PATCHED / BRAINSTORM DONE / CLEANUP DONE / MERGED / RELEASE READY / BLOCKED.

Use `scratchpad_append` for mid-task milestones — do NOT send_input for progress, only on terminal event.

---

You are the <TOPIC> implementation worker for <PROJECT>. Work in an anvil
worktree branched off `<PARENT_BRANCH>`, finish with a PR.

## Step 0 — Workspace
1. cd <PROJECT_ROOT>
2. anvil create agent-<topic-slug> --base <PARENT_BRANCH>
   (check `anvil create --help` for exact flag name in this version)
3. cd into the returned worktree path. ALL edits happen there, not the
   main repo.
4. git status + git branch --show-current to confirm.

## Scope
<Pull from the solo todo. Include file paths, acceptance criteria, and
the spec section that owns the contract.>

## Deliverables (one commit per phase, `[agent]` prefix)

### Phase 1 — <name>
<scope>
Commit: `[agent] <type>(<scope>): <one-line subject>`

### Phase 2 — ...

## Step N — Push + open PR
git push -u origin HEAD
gh pr create --base <PARENT_BRANCH> --title "<title>" \
  --body "<description with summary + test plan>"

## Rules
- Anvil worktree only. Never edit the main repo working tree.
- [agent] prefix on every commit.
- Run the test suite before every commit; iterate until green.
- Stage specific files by name; never `git add -A`.
- No amending. No force-push. No skipping hooks.

## Output format
- If you have follow-up work to file, create a solo todo via
  `todo_create` with scope + rationale.
- If you have working notes that future sessions need (but don't belong
  in the repo), use `scratchpad_write` with a descriptive slug.
- At the end, print the PR URL and nothing else.

Start now with Step 0.
```

## Brief template for a slash-command delegate

```text
## Reporting contract (CRITICAL — do this first)

Invoke the `solo-orchestration` skill immediately and apply Pattern C.

Orchestrator pid: <ORCHESTRATOR_PID_FROM_WHOAMI>.

On terminal event, print the sentinel as your final stdout line AND call:
    mcp__solo__send_input process_id=<ORCH_PID> input="<SENTINEL>: <payload>"

---

You are running <SLASH_COMMAND> on <TARGET>. Do not create worktrees or
branches — this is a read-only dispatch.

## Task
Invoke `<SLASH_COMMAND>` with <ARGS>. Example: `/review 123`, `/qa`,
`/counselors --group smart`, `/brainstorming <topic>`.

## Output
- Concise summary on stdout.
- If the slash command produces structured findings, write them to a
  solo scratchpad with `scratchpad_write slug="<descriptive>"` — do NOT
  dump them into the repo working tree.
- If follow-up work is needed, file solo todos with `todo_create`.

When done, print the scratchpad slug (if any) + the one-line verdict
and nothing else.
```

## Worktree discipline

- User directive: *"why not let them work in seperate anvil worktrees and then create PRs?!"*
- User directive: *"for the future... you don't need to handle the worktrees yourself. Just instruct the agents to do it"*
- Per global CLAUDE.md: always use `anvil`, never Claude's built-in `isolation: "worktree"`.

**The agent creates its own worktree.** The orchestrator does not pre-invoke `anvil`. Each brief's Step 0 is `anvil create`.

Exceptions:
- Pure read-only tasks (e.g. reviews, counselors) can share the main working tree.
- A single delegated task with no parallelism — still preferred in a worktree, not required.

## Scratchpads, todos, and durable memory — clear role separation

User directive: *"based on feedback from agent session you need to create todos or can even tell agents to write scratchpads if necessary. so we don't clutter the repo"*

Four places state can live. Each has one job; don't double-write.

| Surface | Purpose | Lifetime | Read by |
|---|---|---|---|
| **Solo scratchpad** | Working artefact that the NEXT step in the current workflow consumes (brainstorm → plan → review → impl hand-offs). | Archive when the workflow closes (PR merged / todo done). | The next-step agent; occasionally the orchestrator when synthesizing. |
| **Solo todo** | Actionable work with accept criteria. | Closed when done (with a verification comment). | Orchestrator + fix agents. |
| **MemPalace drawer** | Durable cross-session knowledge: design decisions, verbatim user directives, postmortems, "what we learned". | Permanent. Updated in place when the fact evolves. | Any future session via `mempalace_search`. |
| **Repo `docs/`** | Shipping artefact that lives with the code. | Versioned with the codebase. | End users, future contributors. |

### Scratchpad naming convention

```text
<kind>/<identifier>
  kind       = review | plan | audit | brainstorm | handoff | research
  identifier = stable: <repo>-pr-<N> | solo-<N> | <feature-slug>

Examples:
  review/naoray-gaze-pr-10
  review/naoray-gaze-pr-10-rereview     (second-pass differentiator)
  audit/gaze-laravel
  brainstorm/solo-6
  plan/solo-6
  handoff/gaze-v03-cli-to-main
  research/pii-pattern-engine
```

No date suffixes in slugs — the scratchpad's `updated_at` already records time, and dates in slugs age out as workflows span multiple days.

### When to write a scratchpad (vs. final stdout vs. MemPalace drawer)

Write a scratchpad only if:
- Another agent (or a later orchestrator step) will read it as input.
- The content is >200 words of structured data.
- The workflow is multi-step and the artefact needs to survive agent PTY close.

Otherwise: final stdout + (optionally) a MemPalace drawer if the insight is durable.

Write a MemPalace drawer instead of (or in addition to) a scratchpad when:
- The user states a durable rule or preference (verbatim).
- A postmortem resolves what went wrong + the fix pattern.
- A design decision is taken with trade-offs worth preserving across sessions.

Write a solo todo when:
- There's a concrete follow-up action with an acceptance criterion.
- Scope > 5 minutes of agent work.

Write to repo `docs/` when:
- The content ships with the code (specs, ADRs, user-facing guides).

Throwaway debugging output stays in stdout only.

### Lifecycle discipline

- When a PR merges: `scratchpad_archive` the review scratchpad(s) for it.
- When a solo todo closes: archive any scratchpads whose slug references it (e.g. `brainstorm/solo-6` + `plan/solo-6` both go when #6 closes).
- Every session start: `scratchpad_list` and prune anything obviously stale (workflow closed > N weeks ago).
- If two scratchpads cover the same identifier (e.g. first-pass + re-review of the same PR), keep both but distinguish via suffix (`review/naoray-gaze-pr-10-first-pass`, `review/naoray-gaze-pr-10-rereview`).

## When the orchestrator may edit files directly

- Spec writing / revision — fast iteration beats delegating when the content is prose and you already hold the context.
- Documentation updates that are trivial (typo, link, status label) and not worth a PR round-trip.
- Very small one-line fixes that are blocking a delegated agent (e.g. your panic hook wrapper missed a variant).
- Anything the user explicitly asks you to do yourself.

Outside these, push work to a solo delegate.

## Monitoring

> **See also: `solo-orchestration` skill** — mechanism-level guide for push-vs-poll reporting. Defines Pattern A (idle-timer safety net), Pattern B (spawn `send_input` callback = true push), and Pattern C (combo, recommended default). Every agent you spawn should invoke this skill at session start; the orchestrator's job is to seed the brief with the orchestrator pid and safety-net timer.

**Default: Pattern C (combo).** Worker invokes `solo-orchestration` skill → writes progress to `spawn-{PID}-status` scratchpad → calls `send_input(orchestrator_pid, "<SENTINEL>: ...")` on terminal events (DONE/BLOCKED/FAILED). Orchestrator wakes on the push, not on idle-transition false positives. This is the primary mechanism — every worker brief MUST include the reporting-contract preamble:

```
Invoke the `solo-orchestration` skill immediately and apply Pattern C.
Orchestrator pid: <QUERIED_VIA_whoami>.
Sentinel vocab per orchestrator-mode (PLAN PATCHED / REVIEW DONE / IMPL DONE / MERGED / BLOCKED / etc.).
```

**Always pair Pattern C with Pattern A** (idle-timer) as safety net in case the worker forgets to call back:

```
mcp__solo__timer_fire_when_idle_any
  processes: [358, 359, 360]
  max_wait_ms: 1800000      # 30 min ceiling — 2× expected P50 for the task class
  body: "One of the dispatched workers (358 policy, 359 class-names, 360 publish) just went idle or 30 min elapsed. For each worker, check get_process_output, git log on its worktree branch, and PR state. Close finished agents. Schedule another timer if any are still running."
```

The timer is the fallback path. In steady state, Pattern C push arrives first; when it does, orchestrator harvests + closes the worker, then cancels the now-redundant timer (or lets it expire harmlessly).

**Anti-pattern: idle-timer as primary.** Don't arm `timer_fire_when_idle_any` and expect it to be the cheapest wake signal. Idle-transition has false positives (worker briefing completed before work started, worker waiting for user input, etc.). This session (2026-04-24) had timer #1 and #8 fire on already-idle processes — pure waste. Pattern C eliminates those false positives because the worker only pushes on a real terminal event.

**Fallback mechanism: ScheduleWakeup** (in /loop dynamic mode). Needed only when the orchestrator session cannot receive solo timer wake-ups — specifically when it's an external actor registered via `register_agent` (no PTY for Solo to inject into) rather than a Solo-managed child process. Error message gives it away: `timer_* tools require a Solo agent process bound to this MCP session. External actors registered with register_agent cannot receive timer wake-ups; use your own sleep or wait logic instead.`

If you hit that error, fall back to ScheduleWakeup cadence:
- 270s when watching closely + keeping cache warm
- 1200-1800s for idle polls
- Avoid 300-600s — worst of both worlds (cache expired, little progress either)

Between wakeups: reading `get_process_output`, `git log`, and PR state is free.

## Worker done-signal pattern

User directive (2026-04-23): *"instruct your agents to tell you once they are finished with their task or set the timers more optimistic"*. Do both.

Without an explicit sentinel, the orchestrator over-sleeps past worker completion. Failure mode from that session: set a 25-min wake when two workers actually finished in 5 and 9 minutes — binary stalled, user had to prod. Avoidable.

### The rule

Every worker brief MUST include a **Completion signaling** section telling the worker exactly how to announce it's done. Two channels, both cheap:

1. **Sentinel line on final stdout.** A stable, greppable token with optional payload.
2. **`done/<task-slug>` scratchpad.** Durable signal — survives orchestrator session changes.

### Sentinel vocabulary

Use predictable tokens so the orchestrator can grep across workers:

| Worker kind | Sentinel line | Payload |
|---|---|---|
| brainstorm | `BRAINSTORM DONE` | scratchpad slug |
| writing-plans | `PLAN DONE` | scratchpad slug |
| plan reviewer | `REVIEW DONE: <CLEAN\|NITS\|BLOCKERS>` | scratchpad slug |
| PR reviewer/merger | `MERGED <sha>` or `BLOCKED — <count> todos filed` | — |
| release engineer | `RELEASE READY: <release-url>` | binary SHAs |
| impl agent | `IMPL DONE: <PR url or merge sha>` | — |
| cleanup / hygiene | `CLEANUP DONE` | scratchpad slug |
| any worker | `BLOCKED: <reason>` | todo ids it filed |

Terse, one line, on the **final** stdout line. Keep the token to the left of the `:` stable across briefings.

### How the orchestrator polls

Three ways to check, in increasing order of durability:

- `mcp__solo__get_process_output process_id=<N> lines=10` — grep the last 10 lines for the sentinel. Cheapest. Fails if the process gets closed before you check.
- `mcp__solo__scratchpad_list` + filter for `done/` prefix — survives process closure and session handoff.
- `mcp__solo__list_processes` — status field flips to idle when the worker stops; pair with output tail to confirm it ended on the sentinel and not a crash.

On every wake, scan all three. Close workers as soon as the sentinel is confirmed — don't leave idle workers hanging (recurring miss: user had to call this out twice in one session).

### Wake cadence calibration

Estimate worker runtime by task class and set wake ≈ **P50**, not P95. Rely on the sentinel-check to harvest early, rather than over-sleeping for certainty.

| Task class | Typical runtime | Wake target |
|---|---|---|
| Slash-command dispatch (review, counselors, finalize) | 2–8 min | 270s |
| Brainstorm (spec synthesis) | 5–12 min | 270s then 600s |
| Writing-plans | 5–15 min | 600s |
| Plan reviewer (single agent) | 5–20 min | 600s |
| PR reviewer + merge | 10–30 min | 900s |
| Release engineering (cross-build + tag) | 30–120 min | 900s then 1800s |
| Feature impl (multi-phase commit) | 30 min – several hours | 1500s |

Re-calibrate after each wave: if your last 3 wakes caught the worker still mid-flight, double. If they all caught "done 10 min ago," halve.

### Brief template snippet

Paste this into every worker brief, customised per task:

```text
## Completion signaling (CRITICAL)
Orchestrator pid: {ORCH_PID}.  # fill at dispatch time via mcp__solo__whoami

When fully done, do ALL THREE:

1. Print on your **final stdout line**:
       <SENTINEL>: <payload>
   (e.g. `PLAN DONE: plan/solo-6`, `MERGED abc1234`, `RELEASE READY: https://...`)

2. Write a completion scratchpad via `mcp__solo__scratchpad_write`:
   - name: `done/<task-slug>`
   - body: the payload + anything notable (test results, follow-ups, blockers)

3. **Call back the orchestrator** via `mcp__solo__send_input`:
       process_id: {ORCH_PID}
       input: "<SENTINEL>: <payload>. Scratchpad: done/<task-slug>"
   This is Pattern B push — wakes the orchestrator immediately so it
   doesn't over-sleep. Skip only if orch_pid is unknown (then rely on
   idle-timer wake + scratchpad).

If you hit a blocker you can't resolve cleanly, print `BLOCKED: <reason>`,
file a solo todo per blocker, send_input the orchestrator the same line,
and stop. Do NOT proceed past blockers silently.
```

If you find yourself dispatching without this snippet, you're building a stale timer trap. Paste it. For the full push-pattern reference (Pattern A/B/C, spawn prompt template, parallel fan-in), see the `solo-orchestration` skill.

## Session lifecycle

- Spawn one agent per focused task. Don't multi-stage a single agent session through unrelated phases — stale context biases reasoning.
- After close_process, delete or archive the associated anvil worktree if the agent didn't clean up.
- Never re-use the same PTY for two different deliverables.

## Quick invocation

When the user types `/orchestrator-mode`:
1. Acknowledge the mode switch briefly.
2. Audit any in-flight subagents: `mcp__solo__list_processes` + `git log` + open PR list.
3. Clarify the next goal with the user if not already stated.
4. From here on, default to delegation. Edit files only under the exceptions above.
