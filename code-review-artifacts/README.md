# code-review-artifacts

Review artifact skill for understanding changed code before approval.

## What it does

- Produces concise branch diff briefs.
- Draws ASCII runtime flow maps for changed functions and workflows.
- Performs architecture x-rays across user-facing entry points.
- Highlights error paths, delegation, coupling, and review risk.

## What it does not do

- Approve PRs.
- Replace tests, static analysis, or security review.
- Rewrite code unless the user separately asks for fixes.
- Persist diagrams unless the selected workflow explicitly says so and user agrees.

## Modes

| Mode | Behavior |
| --- | --- |
| Diff brief | Summarize branch changes, risk, and review focus. |
| Flow map | Trace changed logic and render ASCII runtime paths. |
| X-ray | Discover entry points, trace selected flows, and evaluate architecture risk. |

## Foundation

Based on program comprehension, change-impact analysis, and code review risk
triage. The skill helps reviewers build a correct mental model before approval.
It does not claim to prove correctness.
