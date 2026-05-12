# Skill Evals — lightweight tracked contract

Skills in this registry ship with a tracked eval contract by default. The default is the lightest shape that catches real regressions at 20–100 skill scale. Heavy harnesses (parallel subagents, HTML viewers, description-optimization loops) are out of scope here.

## What ships in `evals/`

```
evals/
├── trigger.csv (or .json)        # 10–20 prompts: should_trigger column
├── checks.md (or .json)          # 3–5 must-pass deterministic checks
└── rubric.schema.json (optional) # only for style/open-ended quality
```

## `trigger.csv` shape

```csv
prompt,should_trigger,kind,notes
"the user's actual phrasing here",true,explicit-direct,one-line note
"a near-miss that shares keywords",false,near-miss,why this fails
...
```

Rules:

- Minimum 10 prompts; cap around 20. More invites overfit without paying rent.
- At least 1/3 of rows are `should_trigger: false`. **Near-miss negatives are the most valuable signal.** Test inputs that share keywords or concepts with the skill but actually need something else.
- Include a variety of phrasing: explicit ("create a skill"), implicit ("turn this into a workflow"), contextual (intent inferred from conversation), casual (lowercase, abbreviations, typos).
- `notes` column is for the future-self/agent: state why the prompt belongs in this set.

## `checks.md` shape

A markdown file listing must-pass deterministic checks. Each numbered. Each independently verifiable by an LLM or a shell script.

See `evals/checks.md` in this skill for the canonical example (C1–C15).

Optional `evals/checks.json` for machine consumption — same semantics, JSON shape.

## When to run evals

- **At authoring time**: `workflows/create.md` step 8 creates the eval contract; step 9 verifies the mechanical checks. `workflows/evaluate.md` runs the trigger.csv against the description.
- **At revision time**: `workflows/revise.md` step 7 refreshes prompts if the trigger changed.
- **At registry audit time**: a `Stage 9`-style sweep runs `evaluate.md` across all skills to catch drift.
- **At reviewer pass time**: the reviewer checks `evals/` exists and contains near-misses (per `checks.md` C13).

## Pass thresholds (heuristic)

- Trigger hit rate (should-trigger fraction): **≥0.8**
- False-positive rate (should-not-trigger that fire): **≤0.2**
- All must-pass checks: **15/15** (or whatever count the skill declares)

These thresholds are heuristic (evidence tier H). The signal that matters is direction over time: failing prompts surface real description gaps you can fix.

## What NOT to do

- **No grader subagents for trigger evaluation.** The five-part contract is structured enough that single-pass scoring works. Reserve graders for genuinely subjective output quality.
- **No multi-trial variance loops** unless the skill is empirically high-variance — flag separately, then run 3+ trials.
- **No automated description optimization loops** (Anthropic's `run_loop.py` pattern). Heavy harness doesn't pay rent at this scale.
- **No "rerun until passing" loops.** If the description fails, send it back to `workflows/revise.md`.

## Inheriting checks across skills

A skill MAY skip `evals/checks.md` if it explicitly inherits the canonical checklist from `skill-creator/evals/checks.md`. State the inheritance in the skill body's "See also" section. Most skills can do this — the canonical checks are universal.

## Evidence tier of this pattern

**P** (practitioner-backed). The eval shape comes from OpenAI's eval-skills guide ("10–20 prompts; small set of rules"). Pass thresholds are heuristic and should be revised when concrete miss patterns appear.

## Sources

- OpenAI Codex `skill-creator` evaluation guidance.
- Anthropic skill-creator eval pipeline (heavier; we're explicitly lighter).
- ChatGPT Deep Research synthesis on minimal-eval shapes for personal- and team-scale registries.
