# Dispatch workflow

For a coding task (file-modifying delegate).

```
1. SCOPE     Understand task. Read spec + code. Identify file surface. Parallelisable?
2. TODO      Solo todo with branch, parent, file surface, acceptance criteria.
3. SPAWN     mcp__solo__spawn_process kind=agent, agent_tool_id=<from list_agent_tools>,
             name=<task-slug>
4. BRIEF     send_input with full self-contained brief (template below).
5. MONITOR   Pattern C push only. No polling timers. No ScheduleWakeup.
6. REVIEW    Verify commits, run tests, review diff + PR description.
7. CLOSE     close_process. If worktree orphaned, dispatch anvil-agent for cleanup.
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

## Brief template — coding delegate

```text
<paste Reporting contract preamble — see references/reporting-contract.md>

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
