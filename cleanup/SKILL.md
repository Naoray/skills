---
name: cleanup
description: |
  Find and clean up stale project artifacts: implemented plans, completed specs,
  outdated markdown docs, orphaned design files. Removes what's done, updates
  what's drifted. Use when asked to "clean up", "remove old plans", "tidy docs",
  "cleanup stale files", or after shipping a major feature.
---

# Project Cleanup

Find stale plans, specs, and documentation artifacts. Remove what's been implemented, update what's drifted, and leave the project tidy.

## Instructions

### Step 1: Discover Artifacts

Launch **three subagents in parallel** to scan different artifact categories. All subagents are research-only.

**Subagent A — Plans & Specs:**
Find all plan and spec files in the project. Return each file's path, title, and a summary of its status (complete, in-progress, or abandoned). Check these locations:
1. `.superpowers/` — Glob for `**/*.md`, read each file. Look for step checklists (`- [x]`/`- [ ]`) to determine completion percentage.
2. `docs/superpowers/`, `docs/plans/`, `docs/specs/` — if they exist.
3. Project root — `PLAN.md`, `SPEC.md`, `DESIGN.md`, `TODO.md`.
4. Any `*.plan.md` or `*.spec.md` files anywhere in the project.
5. For each file found, determine status:
   - **Fully implemented**: all checklist items checked, or the described feature exists in code (check for key files/classes mentioned in the plan).
   - **Partially implemented**: some items done, some remaining.
   - **Abandoned/stale**: no related commits in 30+ days, or references code/branches that no longer exist.
   - **Active**: recently modified (within 7 days) or references current branch work.

**Subagent B — Documentation Files:**
Find all markdown documentation files and check for staleness. Return each file's path, what it documents, and whether it's current. Check:
1. `README.md` (root and any subdirectory READMEs) — cross-reference with actual project structure. Flag sections that reference files, directories, or features that no longer exist.
2. `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md` — check if they reference current state.
3. `docs/**/*.md` (excluding plans/specs already covered by Subagent A).
4. `.claude/rules/*.md` — check if any reference frameworks/tools not in the project's dependencies.
5. For each file, note:
   - Last modified date (from git log)
   - Whether it references files/functions/routes that still exist
   - Whether it contradicts the current codebase

**Subagent C — Orphaned Artifacts:**
Find miscellaneous stale artifacts that accumulate during development. Return each file's path and why it appears orphaned:
1. Stale git branches — `git branch --merged main` (local branches already merged to main that can be deleted).
2. Old migration drafts or scratch files — any `*.draft.md`, `*.old.md`, `*.bak` files.
3. Empty or near-empty markdown files (< 3 lines of content, excluding frontmatter).
4. `.superpowers/` session artifacts that are older than 30 days.
5. Stale recap files — check `~/.claude/recaps/{project-slug}/` for recaps older than 30 days.

### Step 2: Classify & Present Report

Combine all subagent findings into a cleanup report. Classify each artifact into one of four actions:

```
## Cleanup Report — [Project Name]

### Remove (implemented/obsolete)
Files that are fully implemented or no longer relevant. Safe to delete.
- `.superpowers/plan-auth-system.md` — all 8 steps complete, feature shipped in PR #42
- `docs/specs/old-api-design.md` — superseded by current API, no references remain

### Update (drifted from reality)
Docs that exist for good reason but contain stale information.
- `README.md` — references `src/old-module/` which was renamed to `src/core/`
- `ARCHITECTURE.md` — missing new `notifications` service added last month

### Keep (still active)
Files that are current and should not be touched.
- `.superpowers/plan-payments.md` — 3/7 steps complete, actively being worked on
- `DESIGN.md` — matches current implementation

### Review (ambiguous — needs your decision)
Files where the right action isn't clear.
- `docs/deployment-notes.md` — last updated 45 days ago, unclear if still accurate
- `.superpowers/plan-refactor-models.md` — 5/5 steps checked but tests reference old names
```

### Step 3: Confirm with User

Present the report and ask the user to confirm before taking action. Use AskUserQuestion:

> Here's what I found. I'll **delete** the "Remove" items, **update** the "Update" items in place, and **skip** the "Keep" items. For "Review" items — should I delete, update, or skip each one?
>
> Reply `go` to proceed with defaults, or specify changes (e.g., "keep the deployment notes, delete the rest").

### Step 4: Execute Cleanup

Once confirmed, take actions in order:

1. **Remove files** — delete each confirmed file. For files tracked by git, use `git rm`. For untracked files, use regular deletion.

2. **Update drifted docs** — if files were classified as "Update":

   **If 3+ docs need updating**, suggest running `/document-release` instead:
   > I found N documentation files that need updating. Rather than patching them individually, want me to run `/document-release` for a thorough doc audit? It handles cross-doc consistency, CHANGELOG polish, and discoverability checks that a quick fix would miss.
   >
   > A) Run `/document-release` (recommended — thorough)
   > B) Quick-fix only (patch stale references, skip deep audit)

   **If 1-2 docs need updating**, or the user chose quick-fix, launch a subagent per file that:
   - Reads the current file
   - Reads the actual codebase files it references (to get ground truth)
   - Rewrites only the stale sections to match current reality
   - Preserves the document's voice, structure, and any sections that are still accurate
   - Does NOT add new sections or expand scope — only fixes what's wrong

3. **Clean up merged branches** — if confirmed, delete local branches that are fully merged to main:
   ```
   git branch --merged main | grep -v '^\*\|main\|master\|develop' | xargs -r git branch -d
   ```

4. **Prune old recaps** — if confirmed, remove recap files older than 30 days.

### Step 5: Summary

Present a concise summary of what was done:

```
## Cleanup Complete

- Removed: 3 files (2 completed plans, 1 obsolete spec)
- Updated: 2 files (README.md, ARCHITECTURE.md)
- Pruned: 4 merged branches, 12 old recap files
- Kept: 2 active plans, 1 design doc
```

## Important

- **Never delete README.md, CONTRIBUTING.md, CHANGELOG.md, or CLAUDE.md** — these are living docs. Update them, never remove.
- **Never delete active plans** — if a plan has unchecked items and recent activity, it stays.
- **Never delete DESIGN.md** unless the user explicitly confirms — design docs often have long-term value even after implementation.
- **Always confirm before deleting** — the report + confirmation step is mandatory, never skip it.
- **Preserve git history** — use `git rm` for tracked files so the deletion is visible in history.
- **Be conservative with "Update"** — only fix factually wrong references. Don't rewrite style or add content.
- Stale `.claude/rules/*.md` files should be flagged for review, not auto-deleted — the user may want to update the init instead.
