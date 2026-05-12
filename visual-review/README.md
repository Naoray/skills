# visual-review

Visual QA skill for browser pages, CLI output, TUIs, and visual regression
checks.

## What it does

- Captures browser screenshots for affected pages and states.
- Captures static CLI output screenshots.
- Records TUI interactions when terminal motion matters.
- Compares before/after rendered output when requested.
- Reports visible issues with concrete artifact paths.

## What it does not do

- Replace functional testing or code review.
- Judge brand taste beyond visible usability problems.
- Migrate frontend stacks.
- Push commits or open PRs.

## Modes

| Mode | Behavior |
| --- | --- |
| Web | Browser screenshot QA for pages, PRs, and responsive states. |
| CLI | Terminal screenshot or TUI recording QA. |
| Regression | Before/after artifact comparison. |

## Foundation

Based on visual QA heuristics: layout stability, hierarchy, overflow, responsive
behavior, affordance clarity, terminal legibility, and state coverage. The skill
verifies rendered output, not design taste.
