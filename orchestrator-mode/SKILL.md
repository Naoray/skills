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

## Agent selection (user-specified defaults)

| Agent | When to pick |
|---|---|
| **Codex** (`agent_tool_id=4`) | Default for coding work. Rust impl, tests, refactors, mechanical changes. |
| **Claude** (`agent_tool_id=3`) | Tasks that mix coding with heavy spec reading / synthesis. Any task that needs to run a Claude Code slash command or skill (`/review`, `/qa`, `/brainstorming`, `/deepproduct`, `/counselors`, `/audit`, `/plan-*-review`, `/investigate`, etc.). Opus 4.7 by default. |
| **Gemini** (`agent_tool_id=1`) | **Second-opinion only.** Adversarial challenges, dissenting-view reviews, fresh-eyes checks. Known to be unreliable for single-voice tasks in this env. |

Hard rules from the user:
- **Don't use Gemini for implementation.**
- **Use Codex as default coding.**
- **Claude is good for coding too, especially research-heavy or spec-heavy coding.**

## Post-dispatch review + merge workflow

After a coding agent opens a PR, the orchestrator does **not** merge directly. Instead, dispatch a fresh Claude solo agent per PR with a combined brief covering code-quality review AND plan conformance. The reviewer then gates the merge itself.

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. DISPATCH REVIEWER    One Claude solo agent per open PR.           │
│                         The agent does BOTH passes:                  │
│                                                                      │
│                         a) Run `/review <PR>` for code-quality       │
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
│                    agent_tool_id=<codex or claude>,                  │
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

Copy, fill, send. Do not skip the worktree step — the user has been explicit about this.

```text
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

## Feedback capture — todos + scratchpads, not repo files

User directive: *"based on feedback from agent session you need to create todos or can even tell agents to write scratchpads if necessary. so we don't clutter the repo"*

| Kind of feedback | Where it goes |
|---|---|
| Follow-up work that ships (new behaviour, fix) | **solo todo** via `todo_create` |
| Scoping / research notes for future orchestration | **solo scratchpad** via `scratchpad_write` |
| Review reports, counselors outputs | **solo scratchpad** — never the repo |
| Design specs that ship with the codebase | repo `docs/` (e.g. `docs/roadmap/`) |
| Throwaway debugging output | stdout only |

## When the orchestrator may edit files directly

- Spec writing / revision — fast iteration beats delegating when the content is prose and you already hold the context.
- Documentation updates that are trivial (typo, link, status label) and not worth a PR round-trip.
- Very small one-line fixes that are blocking a delegated agent (e.g. your panic hook wrapper missed a variant).
- Anything the user explicitly asks you to do yourself.

Outside these, push work to a solo delegate.

## Monitoring

**Primary mechanism: solo idle timers.** After dispatching one or more worker agents, schedule a `mcp__solo__timer_fire_when_idle_any` with the worker process IDs and a `max_wait_ms` ceiling. The timer fires when any worker goes idle — which is the cheapest possible wake signal (no polling, no cache burn). The timer's `body` is injected into the orchestrator's PTY as a fresh user turn, so frame it as a self-contained instruction: "Worker N went idle; check its commits, diff, PR state; spawn follow-up or close."

Example dispatch:

```
mcp__solo__timer_fire_when_idle_any
  processes: [358, 359, 360]
  max_wait_ms: 1800000      # 30 min ceiling
  body: "One of the dispatched workers (358 policy, 359 class-names, 360 publish) just went idle or 30 min elapsed. For each worker, check get_process_output, git log on its worktree branch, and PR state. Close finished agents. Schedule another timer if any are still running."
```

When any worker transitions to idle, the orchestrator wakes up, inspects state, and either closes the finished worker or re-arms a timer on the still-running ones.

**Fallback mechanism: ScheduleWakeup** (in /loop dynamic mode). Needed only when the orchestrator session cannot receive solo timer wake-ups — specifically when it's an external actor registered via `register_agent` (no PTY for Solo to inject into) rather than a Solo-managed child process. Error message gives it away: `timer_* tools require a Solo agent process bound to this MCP session. External actors registered with register_agent cannot receive timer wake-ups; use your own sleep or wait logic instead.`

If you hit that error, fall back to ScheduleWakeup cadence:
- 270s when watching closely + keeping cache warm
- 1200-1800s for idle polls
- Avoid 300-600s — worst of both worlds (cache expired, little progress either)

Between wakeups: reading `get_process_output`, `git log`, and PR state is free.

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
