# Dispatch workflow

**Transport: Solo MCP when inside Solo; `solo` CLI when outside Solo.** Every dispatch in this skill — coding, slash-command, reviewer, counselor, brainstorm, cleanup — creates a Solo process, never an in-process Claude Code `Task` / `Agent` / `subagent_type` delegate. If `mcp__solo__whoami` succeeds or Solo session identity is present, spawn with `mcp__solo__spawn_process`, deliver the brief with `mcp__solo__send_input`, and close with `mcp__solo__close_process`/stop equivalent. If Solo MCP tools are unavailable but `solo doctor` works, spawn with `solo processes spawn` via `ctx_shell`. If you find yourself about to call `Task(...)` to "dispatch a subagent", you are off-skill — go back to Solo transport and spawn a real Solo process.

For a coding task (file-modifying delegate).

```
0. TRANSPORT Determine whether this orchestrator is inside Solo:
             - inside Solo: mcp__solo__whoami succeeds / Solo session identity exists
             - outside Solo: MCP unavailable, but `solo doctor` works
             If neither path works, stop and report. NEVER substitute the
             Task/Agent tool here — in-process subagents share the
             orchestrator's context, can't run in anvil worktrees, and can't
             be Pattern-C monitored.
1. RESOLVE   Inside Solo: mcp__solo__list_agent_tools → pick agent_tool_id.
             Outside Solo: resolve the equivalent agent tool id from Solo
             CLI/status surfaces available in that environment. NEVER hardcode
             IDs — they're env-specific and rotate when Solo restarts.
2. SCOPE     Understand task. Read spec + code. Identify file surface. Parallelisable?
3. TODO      solo todos create --project-id <id> --title "<t>" --body "<scope+criteria>"
             (via ctx_shell). Include branch, parent, file surface, acceptance criteria.
4. SPAWN     Inside Solo:
               mcp__solo__spawn_process(project_id=<id>, kind=agent,
                 agent_tool_id=<resolved>, name=<task-slug>)
             Outside Solo:
               solo processes spawn --project-id <id> --kind agent \
                 --agent-tool-id <resolved> --name <task-slug> \
                 --arg "<full brief>" [--json]
               via ctx_shell. Capture the returned process id.
5. BRIEF     Inside Solo: mcp__solo__send_input process_id=<spawned-pid>
             input=<full brief>. Outside Solo: the brief travels as the
             initial CLI `--arg` at spawn time. Use template below.
6. MONITOR   Pattern C push only. No polling timers. No ScheduleWakeup.
             Sentinel arrives via send_input to the orchestrator's pid.
7. REVIEW    Verify commits, run tests, review diff + PR description.
8. CLOSE     Inside Solo: mcp__solo__close_process/stop equivalent.
             Outside Solo: solo processes stop <pid> (via ctx_shell). If
             worktree orphaned, dispatch anvil-agent for cleanup (also via Solo).
```

For a slash-command delegate (read-only or stateless action), use the slash-command brief template below and skip the worktree step.

## Why this split

- Inside Solo, spawn/brief/close with MCP so the delegate is a proper Solo child and Pattern C callbacks have the right parent process.
- Outside Solo, spawn/list/get/stop/todo/scratchpad/project operations use the `solo` CLI through `ctx_shell`; this also keeps large read output compressed.
- `solo todos *` / `solo scratchpads *` remain CLI-friendly even inside Solo when you are doing chatty reads; use MCP for parent/child lifecycle and push input.

## Subagent lifecycle hygiene

- One agent per focused task. Don't multi-stage one PTY through unrelated phases — stale context biases reasoning.
- After `solo processes stop`, delete or archive the anvil worktree if the agent didn't.
- Never re-use the same PTY for two different deliverables.
- Close PTYs as soon as the sentinel lands, not at the next poll.

## Worktree discipline

- Per global CLAUDE.md: always use `anvil`, never Claude's built-in `isolation:"worktree"`.
- The agent owns its workspace setup. Orchestrator does not pre-run anvil for the delegate — Step 0 in the brief tells the delegate to invoke `anvil-agent`.

Exceptions:
- Pure read-only tasks (reviews, counselors) can share the main working tree.
- Single delegated task with no parallelism — worktree preferred but not required.

## North star injection

Every brief below has a `## Project north star` section near the top. Populate it via the `north-star` skill's `inject(<brief>)` procedure ([../../north-star/workflows/consult.md](../../north-star/workflows/consult.md)) before send_input. Two outcomes:

- **Loaded:** Paste the six sections verbatim + source SHA. Delegates use principles to break ties when scope or constraints fork mid-task.
- **Missing:** Paste the literal "Not set for this project. Decide locally and report deviations via scratchpad for follow-up." stanza. Do NOT auto-derive from inside a delegate brief — that violates the user-approval gate.

Pass the content by value, not by path — delegates may work in worktrees with their own snapshot of `docs/NORTH_STAR.md`.

## Brief template — coding delegate

```text
<paste Reporting contract preamble — see references/reporting-contract.md>

---

## Project north star
<paste output of north-star inject() — six sections verbatim, or the "Not set" stanza>

When implementation choices fork, pick the path that serves the mission for
the target users without violating non-goals or constraints. Decision
principles break ties.

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
- File follow-ups via `solo todos create` (CLI).
- Working notes for future sessions: `solo scratchpads create` (CLI) with
  descriptive slug.
- At end: print PR URL + sentinel + mcp__solo__send_input to orchestrator
  pid. Nothing else.

Start now with Step 0.
```

## Brief template — slash-command delegate

```text
<paste Reporting contract preamble — see references/reporting-contract.md>

---

## Project north star
<paste output of north-star inject() — six sections verbatim, or the "Not set" stanza>

---

You are running <SLASH_COMMAND> on <TARGET>. Read-only dispatch — do not
create worktrees or branches.

## Task
Invoke `<SLASH_COMMAND>` with <ARGS>. Examples: `/review 123`, `/qa`,
`/counselors --group smart`, `/brainstorming <topic>`.

## Output
- Concise stdout summary.
- Structured findings → `solo scratchpads create --project-id <id> --name <slug> --content <text>`.
  Do NOT dump into the repo working tree.
- Follow-ups → `solo todos create --project-id <id> --title <t> --body <b>`.

When done: print scratchpad slug (if any) + one-line verdict + sentinel.
```
