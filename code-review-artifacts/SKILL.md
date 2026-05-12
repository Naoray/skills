---
name: code-review-artifacts
description: >
  Create code-review comprehension artifacts: branch diff briefs, ASCII flow
  maps, and architecture x-rays. Use when the user asks "show me the flow",
  "what changed", "walk me through this", "xray", "show me the flows",
  "what does this codebase do", or wants to understand code before approving,
  merging, or refactoring. Prefer this over ad-hoc summaries when changed code
  has branching logic, multiple entry points, new delegation, or architectural
  risk.
---

# Code Review Artifacts

Create review artifacts that help a human build a correct mental model before
approval. This skill is about comprehension and risk triage, not approval.

## Context Budget

Read only:

1. This file.
2. `workflows/preflight.md`.
3. One mode workflow.
4. One principle file when the selected workflow asks for it.

Do not load every file in this skill. `README.md` is human documentation. `evals/`
is not runtime context.

## Mode Selection

- Diff brief: read `workflows/diff-brief.md`.
- Flow map: read `workflows/flow-map.md`.
- X-ray: read `workflows/xray.md`.

If user asks broadly to understand a recent implementation, choose Diff brief.
If they ask how changed logic runs step by step, choose Flow map.
If they ask how a codebase or feature area works across entry points, choose
X-ray.

## Required First Step

Always read `workflows/preflight.md` before the selected workflow.

## Foundation

This skill is based on program comprehension, change-impact analysis, and code
review risk triage. It helps expose execution paths, hidden coupling, missing
error paths, and review-relevant decisions. It does not replace tests, static
analysis, or security review.

## Output Rule

Every output must say what was inspected and what was not inspected.
