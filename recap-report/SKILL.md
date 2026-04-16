---
name: recap-report
description: Use when the user asks for a weekly report, monthly summary, "what did I ship this week", "what did we work on this month", "activity report", "progress report", or wants an overview of work done over a time period. Reads persisted daily recaps and git history to synthesize a period summary.
---

# Recap Report

Generate a summary report for a time period using persisted daily recaps and git history.

## Optional tools

This skill enriches the report with cross-session context from MemPalace when available. If MemPalace isn't installed, skip Subagent C entirely and continue — do not error.

- **MemPalace** (diary + search) — install: https://github.com/MemPalace/mempalace/tree/main?tab=readme-ov-file#quick-start. If missing, skip all `mempalace_*` tool calls and omit the "Cross-session insights" section of the report.

## Usage

`/recap-report` — defaults to last 7 days (week)
`/recap-report week` — last 7 days
`/recap-report month` — last 30 days
`/recap-report 2026-03-01 2026-03-15` — custom date range

## Instructions

### Step 1: Determine Period & Project

Parse the arguments to determine the date range. Derive the project slug from the working directory basename.

Recap files live at: `~/.claude/recaps/{project-slug}/YYYY-MM-DD.md`

### Step 2: Gather Data (three parallel subagents)

**Subagent A — Read Persisted Recaps:**
1. List all recap files in `~/.claude/recaps/{project-slug}/` that fall within the date range
2. Read each file and extract: the frontmatter (date, branch, open_prs, merged_prs) and the full content
3. Return all recap contents ordered by date

**Subagent B — Git & GitHub History for the Period:**
Fill gaps where daily recaps are missing. Run:
1. `git config user.name` — get the current git user's name for filtering
2. `git log --all --oneline --since="{start-date}" --until="{end-date}" --format="%h %s (%ad, %an)" --date=short 2>/dev/null | head -100` — all commits in the period
3. `gh pr list --author="@me" --state=merged --json number,title,mergedAt,url --limit 50 2>/dev/null` — user's PRs merged in the date range
4. `gh pr list --author="@me" --state=closed --json number,title,closedAt,url --limit 20 2>/dev/null` — user's closed PRs in the range
5. `gh pr list --state=open --json number,title,headRefName,author,createdAt --limit 20 2>/dev/null` — all open PRs (to separate user's vs teammates')
6. `gh pr list --state=merged --json number,title,mergedAt,url,author --limit 50 2>/dev/null` — all merged PRs (to identify team activity)
7. Return all raw output, clearly labeling the git user name from step 1

**Subagent C — MemPalace Cross-Session Context:**
Query MemPalace for memories and diary entries spanning the report period. Return all findings:
1. `mempalace_diary_read` with agent_name `"planner"`, last_n 10 — planning observations, sprint outcomes, estimation accuracy
2. `mempalace_diary_read` with agent_name `"architect"`, last_n 10 — design decisions, tradeoffs, "tried X, failed because Y"
3. `mempalace_diary_read` with agent_name `"reviewer"`, last_n 10 — code review patterns, quality issues, bug classes found
4. `mempalace_diary_read` with agent_name `"debugger"`, last_n 5 — failure modes, root causes, diagnostic patterns
5. `mempalace_search` with query based on the project name — find stored knowledge about the project
6. Filter results to entries relevant to the report period (based on timestamps in diary entries)
7. Return: notable decisions made, patterns observed, bugs diagnosed, and any planner observations about velocity/blockers

### Step 3: Synthesize the Report

Combine the daily recaps, git/GitHub data, and MemPalace context. For days without a saved recap, use git log data to fill in. Deduplicate PRs that appear in multiple daily recaps.

Organize the report by:
1. **What you shipped** — only the user's merged PRs (from `--author="@me"`), grouped by theme/feature area
2. **Team activity** — merged PRs and notable commits from other contributors, attributed by author. Keep this separate from the user's own work.
3. **What's still in progress** — open PRs, uncommitted work from the most recent recap. Separate user's open PRs from teammates'.
4. **Key stats** — number of PRs merged (user only), commits, days active
5. **Cross-session insights** — notable decisions, architectural patterns, bugs diagnosed, and planner observations from MemPalace diary entries within the period

**Attribution rule:** `git log --all` includes commits from ALL contributors. The `--author="@me"` PR lists are the authoritative source for the user's work. Never attribute a teammate's commit or PR to the user. When in doubt, check the author field.

### Step 4: Present the Report

```
## Report — [Project Name] ([start date] to [end date])

### Summary
[2-3 sentence overview of the period: main themes, biggest accomplishments]

### Shipped (Your PRs)
[Only PRs from --author="@me", grouped by feature area]
- **[Feature Area]**: #N title, #N title
- **Bug Fixes**: #N title, #N title
- **Infrastructure**: #N title

### Team Activity
[PRs and commits from other contributors, attributed by author]
- **[Author Name]**: #N title, #N title

### In Progress
[Work started but not yet shipped — separate yours from teammates']
#### Yours
- #N: title (branch) — current status
#### Team
- #N: title (branch, author) — current status

### Key Stats
- X PRs merged by you
- Y total commits (yours)
- Z days with recorded activity
- A PRs currently open (yours + team)

### Cross-Session Insights
- [Notable architectural decisions from MemPalace diary]
- [Patterns observed by reviewer/debugger personas]
- [Planner observations about velocity, blockers, estimation accuracy]
(Omit if MemPalace returned nothing relevant to this period)

### Day-by-Day Highlights
[Optional — only if there are enough recaps to make this useful]
- **Mon 3/24**: [1-line summary from recap]
- **Tue 3/25**: [1-line summary from recap]
```

### Step 5: Persist the Report

Save the report to `~/.claude/recaps/{project-slug}/reports/YYYY-MM-DD--{period}.md` where `{period}` is `week`, `month`, or `custom`. Create the `reports/` subdirectory if needed.

## Important

- If no daily recaps exist yet, fall back entirely to git/GitHub history — the report is still useful
- Deduplicate: a PR appearing in 5 daily recaps should only appear once in the report
- Group by theme, not chronologically — the report should read as "what happened" not "here's a timeline"
- Keep it concise enough to share with a manager or in a standup
- **Never mix authorship:** `git log --all` includes all contributors' commits. Only attribute work to the user if it comes from `--author="@me"` PR queries or matches the git user name. Teammate work goes under "Team Activity", always attributed by name.
