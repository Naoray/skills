# Workflow — Evaluate a skill (trigger + checks)

Read `references/skill-evals.md` for the eval contract shape.

This workflow runs the lightweight eval contract that is the default for skills in this registry. It is NOT a full benchmark harness — that is out of scope for personal- and team-scale registries (see `SKILL.md` anti-patterns).

## When to use this workflow

- Authoring a new skill and running its first trigger sanity check (called from `workflows/create.md` step 8 → step 11).
- Revising a skill where the trigger description changed.
- Auditing the registry (Stage 9–style sweep) for skills whose triggers may have drifted.
- Comparing two candidate descriptions for the same skill.

## Inputs

- The target skill's folder path
- `evals/trigger.csv` (or `.json`) with 10–20 prompts, each labeled `should_trigger: true | false`
- `evals/checks.md` (or `.json`) with 3–5 must-pass deterministic checks

If either file is missing, fall back to manual evaluation (2 should-trigger + 1 near-miss prompts shown to the user; treat result as eval-equivalent for one-off skills only).

## Steps

1. **Load `evals/trigger.csv`.** Validate it has at least one should-trigger and one should-not-trigger prompt. If only positives exist, fail — near-miss negatives are the most valuable signal.
2. **Score the trigger description against each prompt.** For each row:
   - Read the description (frontmatter only — body is not loaded during triggering)
   - Decide: would this description fire on this prompt? Justify in one sentence.
   - Mark hit / miss / near-miss
3. **Compute hit rate** for should-trigger prompts (target ≥0.8 per research recommendations).
4. **Compute false-positive rate** for should-not-trigger prompts (target ≤0.2).
5. **Run the must-pass checks** from `evals/checks.md`. These are deterministic — frontmatter shape, body length, no sibling README, evidence tier declared, folder/name match, etc.
6. **Report the eval result** to the user in this shape:

   ```
   TRIGGER EVAL — <skill-name>
   should_trigger hit rate: <fraction> (target ≥0.8)
   should_not_trigger false positive rate: <fraction> (target ≤0.2)
   Near-miss handling: <good | weak — list failing prompts>

   CHECKS
   ✓ <check 1>
   ✓ <check 2>
   ✗ <check 3 — reason>
   ```

7. **Flag any failing prompts** with the specific description gap (missing disqualifier? missing input requirement? overly broad use-when?).
8. **If trigger hit rate <0.8**, propose specific description revisions to the user. Do NOT auto-apply — the description is the contract surface; changes require a revise pass.

## Output

A pass/fail summary the user can act on. Concrete failing prompts with one-line gap analysis each.

## What NOT to do here

- No automated description optimization loops (Anthropic's `run_loop.py` pattern). Heavy harness doesn't pay rent at this scale.
- No multi-trial variance analysis unless the skill is empirically high-variance (flag separately, run trials 3+).
- No grader subagents for trigger evaluation. The five-part contract is structured enough that single-pass scoring works.
- No "rerun until passing" loops. If the description fails the contract, send it back to revise.
