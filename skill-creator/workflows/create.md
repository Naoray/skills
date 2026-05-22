# Workflow — Draft a new skill

This workflow drafts a skill: fit gate, description, body, bundled resources, evals. **It stops at the verified-draft stage.** Release (registry integration, sync, reviewer pass, PR) happens in `workflows/package.md`. Splitting draft from release prevents duplicate sync/reviewer logic — and the skill itself bans that duplication (see `SKILL.md` anti-patterns).

Read `references/trigger-contract.md` before drafting the description. Read `references/evidence-tiers.md` before assigning a tier.

## Steps

1. **Capture intent.** Pull from the current conversation if it contains a workflow ("turn this into a skill"). Otherwise interview the user. Required inputs:
   - a concrete trigger phrase the user would say
   - the artifact the skill produces
   - ≥2 prior real invocations (proof of repetition)
   - the evidence tier of the underlying model (E / P / H)

   Refuse to start without the prior invocations.

2. **Run the fit gate** (see `SKILL.md` Fit gate section). Output the result before any file work. If 2+ checks fail or a rubric override fires, push back and propose the alternative form (snippet / inline prompt / merge / archive).

3. **Search the registry** for collisions and overlap. See `references/registry-integration.md` for backend-specific paths. If overlap is significant, propose merging instead of creating.

4. **Draft the description first** using the 5-part trigger contract (see `references/trigger-contract.md`). Refuse to proceed if any part is empty — the description IS the skill; the body is operational detail after triggering.

5. **Draft the body.** Imperative voice. Match the host's preferred style (terse, verbose — check the user's global rules). Explain WHY for every non-obvious rule. Target ≤200 lines; hard ceiling 500. See `references/instruction-quality.md` for specific writing patterns (critical-first, deterministic scripts vs prose, model laziness).
   - If multi-mode with 3+ modes or growing past ~200 lines: split into a router `SKILL.md` + per-mode files under `workflows/`. See `references/multi-mode-skills.md`.
   - The body's first paragraph must declare evidence tier + provenance (Basis / Source IDs / Reviewed date) — so future-revisers can tell stale citations from current ones and judge whether a tier upgrade is warranted.

   **Pro tip — iterate on a single task first.** Anthropic's strongest practitioner finding: the most effective skill creators iterate on one realistic invocation until it works, then extract the winning approach into a skill. Don't draft a generalized skeleton and try to make it work; capture a known-good run and generalize after.

6. **Decide bundled resources.** Add a script only if (a) the same code would be rewritten ≥3 times, OR (b) the check must be deterministic (model interpretation would diverge across runs). Add a reference only for >100-line domain content or 4+ worked examples. Add an asset only for an output template. When unsure, omit.

7. **Verify mechanically against `skill-creator/evals/checks.md`.** Run C1–C15 (canonical, inherited by default). Stop at the first fail. Optionally add 0–5 skill-specific checks for domain-particular invariants and append them as C16+.

8. **Create the eval contract.** See `references/skill-evals.md` and `workflows/evaluate.md`:
   - `evals/trigger.csv` — 10–20 prompts: explicit, implicit, contextual, **and near-miss negatives that share keywords with the skill** (the most valuable signal).
   - `evals/checks.md` — by default a one-line inheritance: `Inherits skill-creator/evals/checks.md (C1–C15).` Add a `## Skill-specific checks` section ONLY for domain-particular invariants beyond the canonical 15.

   Skip evals only for a draft you have no intention of committing. Anything heading toward PR or registry catalog requires evals.

9. **Run the trigger eval** by following `workflows/evaluate.md`. Hand-off thresholds: trigger hit rate ≥0.8, false-positive rate ≤0.2. If you fail, return to step 4 (revise the description).

## Hand-off

When the draft passes verify + evals, **stop and hand off to `workflows/package.md`**. The package workflow runs registry integration, the sync command, the mandatory reviewer pass, the manual trigger check, the commit, and the PR.

## Output (to user)

Report back:
- Skill path
- Frontmatter description (the 5 parts as the agent will see them)
- Evidence tier + provenance line
- Fit gate result (per check)
- Eval contract summary (number of trigger prompts including near-misses; whether checks are inherited or augmented)
- Verify result (C1–C15)
- "Ready for `workflows/package.md`" if the above all pass; otherwise the specific blockers
