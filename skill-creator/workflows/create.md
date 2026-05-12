# Workflow — Create a new skill

Read `references/trigger-contract.md` before drafting the description. Read `references/evidence-tiers.md` before assigning a tier. Read `references/registry-integration.md` before step 7.

## Steps

1. **Capture intent.** Pull from the current conversation if it contains a workflow ("turn this into a skill"). Otherwise interview the user. Required inputs:
   - a concrete trigger phrase the user would say
   - the artifact the skill produces
   - ≥2 prior real invocations (proof of repetition)
   - the evidence tier of the underlying model (E / P / H)

   Refuse to start without the prior invocations.

2. **Run the fit gate** (see `SKILL.md` Fit gate section). Output the result before any file work. If 2+ checks fail or a rubric override fires, push back and propose the alternative form (snippet / inline prompt / merge / archive).

3. **Search the registry** for collisions and overlap. See `references/registry-integration.md` for backend-specific paths. If overlap is significant, propose merging instead of creating.

4. **Draft the description first** using the 5-part trigger contract (see `references/trigger-contract.md`). Refuse to proceed if any part is empty. The description IS the skill; the body is operational detail after triggering.

5. **Draft the body.** Imperative voice. Match the host's preferred style (terse, verbose — check the user's global rules). Explain WHY for every non-obvious rule. Target ≤200 lines; hard ceiling 500.
   - If multi-mode with 3+ modes or growing past ~200 lines: split into a router `SKILL.md` + per-mode files under `workflows/`. See `references/multi-mode-skills.md` for the pattern and thresholds.
   - The body's first paragraph MUST declare the evidence tier + provenance (Basis / Source IDs / Reviewed date).

6. **Decide bundled resources.** Add a script only if the same code would be rewritten ≥3 times. Add a reference only for >100-line domain content or 4+ worked examples. Add an asset only for an output template. When unsure, omit.

7. **Integrate with the registry manager.** Mandatory — without this the skill is invisible to other agents. Follow the matching section in `references/registry-integration.md`. Honor `.ai/skills/` convention where applicable.

8. **Create the eval contract** (default, per research: lightweight evals pay rent at 20-100 skills). See `references/skill-evals.md` and `workflows/evaluate.md`:
   - `evals/trigger.csv` — 10–20 prompts: explicit, implicit, contextual, near-miss negatives
   - `evals/checks.md` — 3–5 must-pass deterministic checks
   - Optional `evals/rubric.schema.json` for style/open-ended graders

   Skip evals only when the skill is a one-off draft you're not yet committing.

9. **Verify.** Mechanical checks:
   - Folder name === frontmatter `name`
   - Frontmatter has `name` and `description` (all 5 trigger parts present)
   - Body has no MUST/ALWAYS/NEVER without WHY
   - Evidence tier + provenance declared in body's first paragraph
   - No sibling `README.md` / `INSTALLATION.md` / `CHANGELOG.md` inside the folder
   - Eval contract exists OR a written reason for skipping it

10. **Sync.** Run the registry manager's sync if the catalog changed.

11. **Reviewer pass — mandatory before declaring done.** Ask a second agent (different model/provider when possible) or a human reviewer to audit the skill against this contract. Block on unaddressed high-priority findings. Why: author tunnel vision. Fresh context catches stale examples, hardwired assumptions, contract violations.

## Output

Report back to the user:
- Skill path
- Frontmatter description (the 5 parts as the agent will see them)
- Evidence tier + provenance line
- Fit gate score (per check)
- Eval contract summary (number of trigger prompts, number of must-pass checks)
- Registry integration done (which backend, sync run yes/no)
- Reviewer pass status (who reviewed, what they flagged, what was addressed)
