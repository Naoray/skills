# changelog-pr

Unified skill for release PR bodies and `CHANGELOG.md` updates.

## What it does

- Creates Keep a Changelog-style PR bodies from branch diffs or merged PRs.
- Refreshes existing release PR descriptions while preserving manual sections.
- Updates `CHANGELOG.md` `[Unreleased]` with missing user-facing entries.
- Handles squash-merge repositories without trusting SHA ancestry alone.

## What it does not do

- Push branches without explicit user request.
- Rewrite manually authored release notes without preserving intent.
- Include internal-only noise unless it affects users or operators.

## Modes

| Mode | Behavior |
| --- | --- |
| Create PR body | Generate title/body and optionally create PR. |
| Refresh PR body | Update existing release PR description. |
| Update changelog file | Add missing entries to `CHANGELOG.md`. |

## Foundation

Based on Keep a Changelog and reader-impact release note writing. The skill
prioritizes user-visible behavior over raw commit chronology.
