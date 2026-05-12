---
name: code-review-artifacts
description: Create code-review comprehension artifacts (diff briefs, ASCII flow maps, architecture x-rays). Use when the user asks "show me the flow", "what changed", "walk me through this", "xray", "show me the flows", "what does this codebase do", or wants to understand code before approving, merging, or refactoring. Inputs - branch or commit range, scope (file/function/route/CLI command/whole codebase), and a comparison base. Do not use when the user wants approval (this is comprehension, not approval), is doing functional/security/lint review (separate skills), wants a refactor (rewrite request, not review), or is reading already-shipped code that is unchanged. Produces a diff brief OR ASCII flow map OR architecture x-ray, each prefixed with an explicit "Inspected / Not inspected" scope statement. Escalate if scope is unclear, comparison base cannot be determined, or the codebase is too large for a single artifact (recommend a scoped sub-run).
---

# Code Review Artifacts

Create review artifacts that help a human build a correct mental model before approval. This skill is about comprehension and risk triage, not approval.

**Evidence tier**: P (practitioner-backed)
**Basis**: program comprehension research (mental-model construction during code reading), change-impact analysis, code review risk triage. Predecessors: `flow-review` (mode → flow-map) and `xray` (mode → x-ray) in this registry.
**Source IDs**: program-comprehension literature (Sillito et al. on developer questions during code review), Google/Microsoft modern code review studies, Naoray internal `flow-review` + `xray` skills (now consolidated here).
**Reviewed**: 2026-05-12

## Context Budget

Read only:

1. This file.
2. `workflows/preflight.md`.
3. One mode workflow.
4. One principle file when the selected workflow asks for it.

Do not load every file in this skill. `evals/` is not runtime context.

## Route

Read this file. Then read exactly one of:

- `workflows/diff-brief.md` — summarize a branch's changes by purpose, list review risks (high/medium/low), suggest a next artifact.
- `workflows/flow-map.md` — trace changed logic and render ASCII runtime paths with `[NEW]`/`[MOD]`/`[REMOVED]` markers.
- `workflows/xray.md` — discover entry points, scope flows, render diagrams, evaluate for dead ends, missing error paths, wrong-direction coupling.

Heuristics:

- "what changed", "summarize this PR" → Diff brief.
- "show me the flow", "how does this run" → Flow map.
- "how does this codebase work", "xray", "architecture review" → X-ray.

## Required First Step

Always read `workflows/preflight.md` before the selected workflow.

## Output Rule

Every output MUST state what was inspected and what was not inspected — because reviewers need to know the artifact's scope gap to make an informed approval decision; an unscoped artifact reads as authoritative when it isn't.
