---
name: visual-review
description: Visually verify rendered output for web pages, PRs, CLI commands, and TUIs. Use when the user asks for "visual review", "visual QA", "screenshot this", "check how this PR looks", "review CLI output", "capture a terminal command", or "record this TUI". Inputs - target URL or PR number, mode (browser / CLI / TUI / regression), and routes / commands / viewports to check. Do not use when the user wants functional QA (use a testing skill), brand-taste judgment (this verifies rendered output, not design taste), frontend-stack migration (out of scope), or wants to push commits (this is read-only). Produces a screenshot or recording set + a visible-issues report listing artifact paths, routes/commands/viewports inspected, and any layout/overflow/state-coverage gaps found. Escalate if the target is unreachable, the PR is too large for a single review pass (recommend scope reduction), or the local dev server cannot start.
---

# Visual Review

Verify what the user can see: layout, overflow, responsive behavior, hierarchy, terminal rendering, screenshots, and obvious visual regressions.

**Evidence tier**: P (practitioner-backed)
**Basis**: visual QA heuristics — layout stability, overflow, responsive behavior, hierarchy, affordance clarity, terminal legibility, state coverage. Adjacent to WCAG accessibility standards (E-tier) but this skill scopes to visible-output verification, not full accessibility audits.
**Source IDs**: WCAG 2.x accessibility guidelines, Nielsen usability heuristics, Naoray internal `visual-review` + `visual-review-cli` predecessors (now consolidated here).
**Reviewed**: 2026-05-12

## Context Budget

Read only:

1. This file.
2. `workflows/preflight.md`.
3. One mode workflow.
4. `references/principles/visual-qa.md` when judging findings.

Do not load every file in this skill. `evals/` is not runtime context.

## Route

Read this file. Then read exactly one of:

- `workflows/web-review.md` — browser/UI review of a PR or live URL across viewports.
- `workflows/cli-review.md` — terminal/TUI capture using `termshot` (static) or `vhs` (recordings).
- `workflows/regression.md` — before/after comparison for visual diffs.

If a PR changes both browser UI and CLI/TUI output, run the relevant modes separately and report them in one final summary.

## Required First Step

Always read `workflows/preflight.md` before the selected workflow.

## Output Rule

Every output MUST include screenshot or recording paths when artifacts were created, plus the routes, commands, viewport sizes, and states inspected — because a visual-review without an artifact and scope statement is just a claim, not evidence the reviewer can verify.
