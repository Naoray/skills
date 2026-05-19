---
name: cleanup
description: Use when the user asks to clean up a project, remove old plans, tidy docs, cleanup stale files, prune completed specs, or inspect artifacts after shipping a major feature. Inputs - project root, current branch context, and user confirmation before deleting or rewriting files. Do not use when the user wants disk-space cleanup, dependency pruning, code refactoring, or documentation generation; use a system-cleanup, package, refactor, or docs workflow instead. Produces a cleanup report classifying artifacts as remove, update, keep, or review, then confirmed file/doc changes. Escalate if deletion risk is ambiguous, living docs are involved, or more than two docs need substantive updates.
---

# Project Cleanup

**Evidence tier**: P
**Basis**: Practitioner workflow for repository hygiene, stale artifact review, and conservative documentation cleanup.
**Source IDs**: cleanup/SKILL.md workflow; git branch and markdown artifact audit conventions
**Reviewed**: 2026-05-12

Find stale plans, specs, and documentation artifacts. Remove what's been implemented, update what's drifted, and leave the project tidy.

## Workflow

### Step 1: Discover artifacts

Run three discovery passes. If your runtime supports parallel sub-tasks (subagents, parallel tool calls), run them concurrently; otherwise run sequentially. All passes are read-only.

**Pass A — Plans & specs.** Return each file's path, title, and status (fully implemented / partially implemented / abandoned / active).

Scan locations vary by tooling stack — see [`references/registry-integration.md`](references/registry-integration.md) for the concrete path table per backend. Common targets: project-level `PLAN.md`/`SPEC.md`/`DESIGN.md`/`TODO.md`, any `*.plan.md` or `*.spec.md`, and backend-specific plan dirs.

Status rubric:
- **Fully implemented**: all checklist items checked, or the described feature exists in code (verify by locating key files/classes the plan names).
- **Partially implemented**: some items done, some remaining.
- **Abandoned/stale**: no related commits in 30+ days, or references code/branches that no longer exist.
- **Active**: modified within 7 days, or references current branch work.

**Pass B — Documentation files.** Find markdown documentation and check for staleness. Return path, what it documents, and whether it's current.

- `README.md` (root + subdirs) — flag sections referencing files/directories/features that no longer exist.
- `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md` — check against current state.
- Any `docs/**/*.md` (excluding plans/specs covered by Pass A).
- Tool-rules files (e.g. `.claude/rules/*.md`, `AGENTS.md`, `GEMINI.md`) — flag if they reference frameworks/tools not in current dependencies.

For each file note: last modified date (from `git log`); whether it references files/functions/routes that still exist; whether it contradicts the current codebase.

**Pass C — Orphaned artifacts.** Return path + reason for each:

- Local git branches already merged to main: `git branch --merged main`.
- Draft / scratch files — `*.draft.md`, `*.old.md`, `*.bak`.
- Empty or near-empty markdown files (<3 content lines, excluding frontmatter).
- Tooling-side session artifacts older than 30 days. Backend-specific locations are in [`references/registry-integration.md`](references/registry-integration.md).

### Step 2: Classify & present report

Combine all findings into a cleanup report. Classify each artifact into one of four actions:

```
## Cleanup Report — [Project Name]

### Remove (implemented/obsolete)
Files that are fully implemented or no longer relevant. Safe to delete.
- `<path>` — why it's safe to remove

### Update (drifted from reality)
Docs that exist for good reason but contain stale information.
- `<path>` — what is stale

### Keep (still active)
Files that are current and should not be touched.
- `<path>` — why it's still load-bearing

### Review (ambiguous — needs your decision)
Files where the right action isn't clear.
- `<path>` — why classification is uncertain
```

### Step 3: Confirm with the user

Present the report and ask before any destructive action. Why: deletion is irreversible and classification can be wrong.

Use whatever interactive prompt your runtime supports (e.g. Claude Code's structured `AskUserQuestion`, Codex's `read -p`, or plain stdin). Either way, default to inaction until the user says go.

Suggested phrasing:

> Here's what I found. I'll **delete** the "Remove" items, **update** the "Update" items in place, and **skip** the "Keep" items. For "Review" items — should I delete, update, or skip each one?
>
> Reply `go` to proceed with defaults, or specify changes.

### Step 4: Execute cleanup

Once confirmed, act in order:

1. **Remove files** — `git rm` for tracked files (so deletion shows in history); regular delete for untracked.
2. **Update drifted docs** — if 3+ docs need updates, suggest the user run a docs-audit workflow (e.g. `/document-release`) instead of patching individually; cross-doc consistency is hard in single edits. If 1–2 docs, patch in place: read the file, read the codebase it references, rewrite only stale sections, preserve voice and structure, don't add new sections.
3. **Clean up merged branches** — if confirmed: `git branch --merged main | grep -vE '^\*|main|master|develop' | xargs -r git branch -d`.
4. **Prune backend-specific artifacts** — see [`references/registry-integration.md`](references/registry-integration.md) for tooling-side locations (e.g. session caches, recap dirs).

### Step 5: Summary

Present a concise summary:

```
## Cleanup Complete

- Removed: N files (...)
- Updated: N files (...)
- Pruned: N merged branches, N tooling artifacts
- Kept: N active plans, N living docs
```

## Hard rules

- **Never delete `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, or `CLAUDE.md` / `AGENTS.md`.** These are living docs. Update them, never remove. Why: removal silently breaks contributor onboarding and tooling integration.
- **Never delete active plans.** If a plan has unchecked items and recent activity, it stays. Why: in-flight work loses its acceptance criteria otherwise.
- **Never delete `DESIGN.md` without explicit confirmation.** Design docs often have long-term value past implementation. Why: irreversible loss of decision rationale.
- **Always confirm before deleting.** Report + confirmation is mandatory. Why: classification can be wrong; deletion is final.
- **Preserve git history.** `git rm` for tracked files. Why: blame trail is the audit log.
- **Be conservative on Update.** Only fix factually wrong references. Don't rewrite style or expand scope.
- **Flag, don't auto-delete, tool-rules files** (e.g. `.claude/rules/*.md`). The user may want to update the init instead.
