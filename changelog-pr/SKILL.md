---
name: changelog-pr
description: Create or update release/changelog artifacts using Keep a Changelog. Use when the user asks to create a changelog PR, update a changelog, refresh a release PR body, summarize changes since a tag, or prepare a PR description from a branch diff. Inputs - source/target branches (or current branch → main default), repo merge style (squash or regular), and existing CHANGELOG.md / release PR if updating. Do not use when the PR is non-release (write a normal PR body), the user wants raw commit summaries (use git log), the work is cutting a new release branch (separate workflow), or the request is a one-off email/note. Produces a Keep a Changelog-formatted PR body OR updated CHANGELOG.md [Unreleased] section, with sections only for categories that have entries. Escalate if merge style cannot be detected, existing manual release notes are present and may be stale, or source/target branches are ambiguous.
---

# Changelog PR

Prepare user-facing release notes and changelog PR bodies from commits, merged PRs, tags, or branch diffs.

**Evidence tier**: P (practitioner-backed)
**Basis**: Keep a Changelog v1.1.0 specification, reader-impact release-note writing practice.
**Source IDs**: keepachangelog.com, "Common Changelog" conventions, Naoray internal release-note patterns from `create-changelog-pr` and `update-changelog` (predecessors).
**Reviewed**: 2026-05-12

## Context Budget

Read only:

1. This file.
2. `workflows/preflight.md`.
3. One mode workflow.
4. `references/principles/changelog.md`.

Do not load every file in this skill. `evals/` is not runtime context.

## Route

Read this file. Then read exactly one of:

- `workflows/create-pr-body.md` — generate title + Keep a Changelog body from a branch diff or merged PRs; optionally run `gh pr create`.
- `workflows/refresh-pr-body.md` — update an existing release PR's body, preserving manual sections.
- `workflows/update-changelog-file.md` — add missing user-facing entries to `CHANGELOG.md` `[Unreleased]`.

Heuristics:

- "create changelog PR" → Create PR body.
- "update changelog" → Update `CHANGELOG.md`.
- "refresh/sync the PR body" → Refresh existing PR body.

## Required First Step

Always read `workflows/preflight.md` before the selected workflow.
