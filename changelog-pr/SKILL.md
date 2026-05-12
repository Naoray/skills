---
name: changelog-pr
description: >
  Create or update release/changelog artifacts using Keep a Changelog. Use when
  the user asks to create a changelog PR, update a changelog, refresh a release
  PR body, summarize changes since a tag, or prepare a PR description from a
  branch diff. Handles squash-merge repositories, regular commit ranges, and
  existing CHANGELOG.md files.
---

# Changelog PR

Prepare user-facing release notes and changelog PR bodies from commits, merged
PRs, tags, or branch diffs.

## Context Budget

Read only:

1. This file.
2. `workflows/preflight.md`.
3. One mode workflow.
4. `principles/changelog.md`.

Do not load every file in this skill. `README.md` is human documentation.

## Mode Selection

- Create PR body: read `workflows/create-pr-body.md`.
- Refresh existing PR body: read `workflows/refresh-pr-body.md`.
- Update `CHANGELOG.md`: read `workflows/update-changelog-file.md`.

If user says "create changelog PR", choose Create PR body.
If user says "update changelog", choose Update `CHANGELOG.md`.
If user says "refresh/sync the PR body", choose Refresh existing PR body.

## Required First Step

Always read `workflows/preflight.md` before the selected workflow.

## Foundation

This skill is based on Keep a Changelog and release-note writing practice:
organize by user-visible change type, write from reader impact, and avoid raw
commit-message dumps.
