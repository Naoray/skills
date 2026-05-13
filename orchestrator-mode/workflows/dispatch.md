# Dispatch workflow

**Transport: Solo MCP only.** Every dispatch in this skill — coding, slash-command, reviewer, counselor, brainstorm, cleanup — is a `mcp__solo__spawn_process` call. The Claude Code in-process `Task` / `Agent` / `subagent_type` tools are NOT a valid substitute and must never be used in orchestrator-mode. If you find yourself about to call `Task(...)` to "dispatch a subagent", you are off-skill — go back to `mcp__solo__list_agent_tools` and spawn a real Solo process instead.

For a coding task (file-modifying delegate).

```
0. RESOLVE   mcp__solo__list_agent_tools → pick agent_tool_id for the delegate
             family (Codex / Claude / Gemini / Cursor). NEVER hardcode IDs —
             they're env-specific and rotate when Solo restarts. NEVER
             substitute the Task/Agent tool here — in-process subagents share
             the orchestrator's context, can't run in anvil worktrees, and
             can't be Pattern-C monitored.
1. SCOPE     Understand task. Read spec + code. Identify file surface. Parallelisable?
2. TODO      Solo todo with branch, parent, file surface, acceptance criteria.
3. SPAWN     mcp__solo__spawn_process kind=agent, agent_tool_id=<resolved>,
             name=<task-slug>
4. BRIEF     mcp__solo__send_input with full self-contained brief (template below).
5. MONITOR   Pattern C push only. No polling timers. No ScheduleWakeup.
6. REVIEW    Verify commits, run tests, review diff + PR description.
7. CLOSE     mcp__solo__close_process. If worktree orphaned, dispatch anvil-agent
             for cleanup (also via Solo).
```

For a slash-command delegate (read-only or stateless action), use the slash-command brief template below and skip the worktree step.

## Subagent lifecycle hygiene

- One agent per focused task. Don't multi-stage one PTY through unrelated phases — stale context biases reasoning.
- After `close_process`, delete or archive the anvil worktree if the agent didn't.
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
- File follow-ups via todo_create with scope + rationale.
- Working notes for future sessions: scratchpad_write with descriptive slug.
- At end: print PR URL + sentinel + send_input. Nothing else.

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
- Structured findings → scratchpad_write slug=`<descriptive>`. Do NOT dump
  into the repo working tree.
- Follow-ups → todo_create.

When done: print scratchpad slug (if any) + one-line verdict + sentinel.
```
