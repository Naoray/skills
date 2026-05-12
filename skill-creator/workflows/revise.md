# Workflow — Revise an existing skill

This workflow revises an existing skill. **It stops at the verified-revision stage.** Release (catalog refresh, sync, reviewer pass, PR) happens in `workflows/package.md`.

Read `references/trigger-contract.md` if the trigger description is being touched. Read `references/lifecycle.md` if the revision changes lifecycle state (active / merge candidate / archived).

## When to use this workflow vs. create

- **Revise**: the skill exists in the registry, you are improving it, the `name` and folder path stay identical.
- **Create**: new skill, no prior folder. Use `workflows/create.md`.
- **Merge**: two existing skills should become one. Pick the surviving `name`, revise it with the merged scope, archive the other (see `references/lifecycle.md`).

## Steps

1. **Read the current `SKILL.md`** plus any referenced files.
2. **Diff against the proposed change.** Note what the user (or a reviewer) flagged.
3. **Preserve `name` and folder path.** Do NOT create a `v2/` directory. Do NOT rename. If the trigger has genuinely diverged from the original scope, that's a new skill — return to `workflows/create.md`.
4. **Update `description` if the trigger has drifted.** Re-verify all 5 parts of the trigger contract are present (Use when / Inputs / Do not use when / Produces / Escalate if).
5. **Update evidence tier and provenance if the foundation shifted.** Tier upgrades (H → P, P → E) require new source citations. Tier downgrades are allowed without new sources but should explain why.
6. **Re-run mechanical verification** against `skill-creator/evals/checks.md` C1–C15.
7. **Update evals.** If `evals/trigger.csv` exists, refresh the prompts where the trigger changed. Add a near-miss for any new disqualifier you introduced. Re-run `workflows/evaluate.md`.

## Hand-off

When the revision passes verify + evals, **stop and hand off to `workflows/package.md`**. The package workflow runs catalog refresh (if the catalog `description:` field changed), sync, reviewer pass, and commit.

## Output (to user)

Report back:
- Diff summary (which fields/sections changed)
- New evidence tier + provenance if changed
- Eval contract delta (prompts added/removed/changed)
- Verify result (C1–C15)
- Registry-integration status (will catalog refresh be required in package?)
- "Ready for `workflows/package.md`" if the above all pass; otherwise the specific blockers
