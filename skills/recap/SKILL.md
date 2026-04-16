---
name: recap
description: Use when starting a new session after time away, beginning work for the day, returning from a break, or when the user asks "what was I working on", "where did I leave off", "recap", "catch me up", "what happened yesterday", or "what did I do". Also use when the SessionStart hook indicates it is the first session of the day.
---

# Daily Recap

Summarize recent project activity and identify where you left off.

## Optional tools

This skill pulls context from three optional tools. If a tool isn't installed on this machine, silently skip its data source and continue with the rest — do not error.

- **MemPalace** (diary + search) — install: https://github.com/MemPalace/mempalace/tree/main?tab=readme-ov-file#quick-start. If missing, skip all `mempalace_*` tool calls in Subagent C.
- **superpowers** (plans/specs) — install: https://github.com/obra/superpowers. If `.superpowers/` doesn't exist in the project, skip it.
- **gstack** (session artifacts) — if `~/.gstack/` doesn't exist, skip it.

## Instructions

### Step 1: Dispatch Parallel Subagents

Launch **four subagents in parallel** using the Agent tool. Each gathers a different category of information. All subagents are research-only — they must NOT make any changes.

**Subagent A — Local Git State:**
Gather the current working tree state. Run these commands and return ALL output:
1. `echo "Branch: $(git branch --show-current)"` — current branch
2. `git status --short` — uncommitted changes
3. `git diff --stat HEAD 2>/dev/null | tail -15` — uncommitted file-level diff summary
4. `git stash list 2>/dev/null | head -5` — stashed work
5. `git log --oneline --since="48 hours ago" --format="%h %s (%ar, %an)" 2>/dev/null | head -30` — recent local commits
6. If no commits in 48h, expand: `git log --oneline --since="7 days ago" --format="%h %s (%ar, %an)" 2>/dev/null | head -20`

**Subagent B — GitHub Activity (PRs & Remote Branches):**
Gather all GitHub-side activity. Run these commands and return ALL output:
1. `gh pr list --author="@me" --state=open --json number,title,baseRefName,headRefName,updatedAt,url,reviewDecision --limit 15 2>/dev/null` — open PRs with review status
2. `gh pr list --author="@me" --state=merged --json number,title,mergedAt,url --limit 10 2>/dev/null` — recently merged PRs
3. `gh pr list --author="@me" --state=closed --json number,title,closedAt,url --limit 5 2>/dev/null` — recently closed (not merged) PRs
4. `gh pr list --state=open --json number,title,headRefName,author,updatedAt --limit 15 2>/dev/null` — all open PRs (to see teammate activity)
5. `git fetch --prune 2>/dev/null && git branch -r --sort=-committerdate | head -20` — recently pushed remote branches (includes worktree pushes that were cleaned up locally)
6. `git log --all --remotes --oneline --since="48 hours ago" --format="%h %s (%ar, %an)" 2>/dev/null | head -30` — all remote commit activity (catches pushes from worktrees/other machines)
7. If no remote activity in 48h, expand to 7 days for the above commands.

**Subagent C — Project Memory & Context (Claude Memory + MemPalace):**
Read project memory files AND query MemPalace for cross-session context. Research only, return findings:
1. Read the project's MEMORY.md (path: `~/.claude/projects/-{path-with-dashes}/memory/MEMORY.md` where the path is derived from the working directory)
2. For any memory entries that reference "in progress", "remaining work", "remaining bug", "TODO", or "next steps" — read those linked memory files too
3. Check for any plan files in `.superpowers/` or similar directories
4. Query MemPalace for project-relevant context:
   a. `mempalace_diary_read` with agent_name `"planner"`, last_n 5 — recent planning/sprint observations
   b. `mempalace_diary_read` with agent_name `"architect"`, last_n 5 — recent design decisions and tradeoffs
   c. `mempalace_diary_read` with agent_name `"debugger"`, last_n 3 — recent failure modes or open bugs
   d. `mempalace_search` with query derived from the project name or current branch — find memories about active work
5. Return a summary of: what work is tracked as in-progress, known bugs, any noted next steps, and relevant MemPalace context (diary observations, stored decisions, flagged issues)

**Subagent D — Plans, Specs & Design Artifacts:**
Check for in-progress plans, specs, and design documents that indicate active or planned work. Research only, return findings:
1. Search for plan/spec files in `.superpowers/` directory — use Glob for `**/*.md` and read any found files. These contain implementation plans and specs from superpowers/gstack workflows.
2. Search for plan files in `docs/superpowers/` or `docs/plans/` if they exist.
3. Check for any `PLAN.md`, `SPEC.md`, or `DESIGN.md` files in the project root.
4. Check for gstack session artifacts: `~/.gstack/sessions/` and `~/.gstack/analytics/skill-usage.jsonl` (last 5 entries) to see which skills/workflows were recently used.
5. Return a summary of: active plans (with their status/progress), specs being implemented, and any design decisions documented.

### Step 2: Synthesize

Once all subagents return, combine their findings. Identify:
- **What was actively being worked on** — current branch, recent commits, uncommitted changes
- **What shipped recently** — merged PRs
- **What's pending review** — open PRs, their review/CI status
- **Remote-only branches** — branches pushed to GitHub but not present locally (from cleaned-up worktrees or other machines). Highlight these as potential forgotten work.
- **Teammate activity** — PRs or commits from other contributors that may affect your work
- **What's unfinished** — uncommitted changes, WIP branches, stashed work, memory entries about remaining work
- **Active plans/specs** — any superpowers/gstack plans or specs that indicate planned or in-progress work
- **MemPalace context** — recent diary observations, stored architectural decisions, flagged bugs or patterns from past sessions

### Step 3: Present & Persist the Recap

Use this format, omitting empty sections. After presenting to the user, **save the recap** to `~/.claude/recaps/{project-slug}/YYYY-MM-DD.md` (using today's date). Derive the project slug from the working directory basename (e.g. `virovet-diagnostik.de`). Create the directory if it doesn't exist. If a recap for today already exists, overwrite it.

The persisted file must include a YAML frontmatter block for machine parsing by `/recap-report`:

```yaml
---
date: YYYY-MM-DD
project: <project slug>
branch: <current branch>
open_prs: [list of PR numbers]
merged_prs: [list of PR numbers merged in the recap window]
---
```

Then the full recap content below. Use this output format:

```
## Daily Recap — [Project Name]

### Where You Left Off
[Current branch + what it's about + state of uncommitted work.
 If there are memory entries about remaining work, surface them here.]

### Recent Activity
- [Bullet list of commits grouped by topic/branch, most recent first]

### Open PRs
- #N: title (branch -> base) — review status, CI status

### Recently Shipped
- #N: title (merged X ago)

### Active Plans & Specs
- [Any superpowers/gstack plans or specs found, with their status]

### Closed Without Merge
- #N: title (closed X ago) — if any

### Teammate Activity
- [PRs opened/merged by others, commits on shared branches]

### Remote Branches (no local checkout)
- [Branches that exist on origin but not locally — may be from cleaned-up worktrees]

### Unfinished Work
- [Uncommitted changes, stashed work, WIP items from memory]

### MemPalace Context
- [Notable diary observations from planner/architect/debugger personas]
- [Relevant stored decisions or flagged issues from mempalace_search]
(Omit this section if MemPalace returned nothing relevant)

### Suggested Next Steps
- [Populated by Step 4 subagent — see below]
```

### Step 4: Generate "What to Work On Next" Suggestions

After presenting the recap and saving it to disk, launch a **single subagent** (research-only, no changes) to generate prioritized next-step suggestions.

**Subagent E — Next Steps Advisor:**

Provide this subagent with:
- The full text of the recap you just presented (pass it in the prompt, don't make it re-read files)
- The path to any active plan files found by Subagent D
- Any MemPalace context from Subagent C (diary entries, stored decisions, flagged issues)

The subagent must:
1. Read any active plan files (from `.superpowers/`, `PLAN.md`, etc.) to understand the full scope of planned work and which steps are complete vs remaining.
2. Read any memory entries flagged as "in progress", "TODO", or "next steps" for additional context.
3. Analyze the recap holistically and produce **2–3 concrete, actionable suggestions** ranked by priority, considering:
   - **Continuity** — resuming unfinished work on the current branch or open PRs needing attention (rebases, review responses, CI fixes)
   - **Plan progress** — the next incomplete step in an active implementation plan
   - **Blockers & dependencies** — teammate PRs that need review before your work can proceed, or merge conflicts that will only get worse
   - **Quick wins** — small items (stashed work, minor TODOs, PR cleanups) that can be knocked out fast to build momentum
4. Return the suggestions in this format:
   ```
   1. **[Action verb]: [Specific task]** — [1-sentence rationale referencing the recap data]
   2. **[Action verb]: [Specific task]** — [1-sentence rationale]
   3. **[Action verb]: [Specific task]** — [1-sentence rationale] (optional)
   ```

Once the subagent returns, **append its suggestions** to the "Suggested Next Steps" section of both the displayed recap and the persisted file. If the subagent finds no meaningful suggestions (e.g., everything is shipped and clean), say so: "All caught up — no urgent next steps."

## Important

- Keep it concise — highlight what matters, skip noise
- Cross-reference memory entries with actual git state — memory may be stale
- This is purely informational — don't take any actions or make changes
- If multiple contributors, note their activity separately so the user knows what teammates did
- If returning from a longer absence, mention anything that may need rebasing or conflict resolution
- Remote-only branches are important — they often represent worktree work that was pushed but the worktree was cleaned up locally
