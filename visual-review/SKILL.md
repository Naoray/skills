---
name: visual-review
description: >
  Visually verify rendered output for web pages, PRs, CLI commands, and TUIs.
  Use when the user asks for "visual review", "visual QA", "screenshot this",
  "check how this PR looks", "review CLI output", "capture a terminal command",
  or "record this TUI". Supports web/browser review, terminal/CLI review, and
  before/after visual regression checks.
---

# Visual Review

Verify what the user can see: layout, overflow, responsive behavior, hierarchy,
terminal rendering, screenshots, and obvious visual regressions.

## Context Budget

Read only:

1. This file.
2. `workflows/preflight.md`.
3. One mode workflow.
4. `principles/visual-qa.md` when judging findings.

Do not load every file in this skill. `README.md` is human documentation. `evals/`
is not runtime context.

## Mode Selection

- Web review: read `workflows/web-review.md`.
- CLI/TUI review: read `workflows/cli-review.md`.
- Before/after comparison: read `workflows/regression.md`.

If a PR changes both browser UI and CLI/TUI output, run the modes separately and
report them in one final summary.

## Required First Step

Always read `workflows/preflight.md` before the selected workflow.

## Foundation

This skill is based on visual QA heuristics: layout stability, overflow,
responsive behavior, hierarchy, affordance clarity, terminal legibility, and
state coverage. It verifies rendered output, not design taste.

## Output Rule

Every output must include screenshot or recording paths when artifacts were
created, plus any routes, commands, viewport sizes, and states inspected.
