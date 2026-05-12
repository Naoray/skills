# Workflow — Revise an existing skill

Read `references/trigger-contract.md` if the trigger description is being touched. Read `references/lifecycle.md` if the revision touches lifecycle state (active / merge candidate / archived).

## When to use this workflow vs. create

- **Revise**: the skill exists in the registry, you are improving it, the `name` and folder path stay identical.
- **Create**: new skill, no prior folder. Use `workflows/create.md`.
- **Merge**: two existing skills should become one. Pick the surviving `name`, revise it with the merged scope, archive the other.

## Steps

1. **Read the current `SKILL.md`** plus any referenced files.
2. **Diff against the proposed change.** Note what the user (or a reviewer) flagged.
3. **Preserve `name` and folder path.** Do NOT create a `v2/` directory. Do NOT rename. If the trigger has genuinely diverged, that's a new skill, not a revision.
4. **Update `description` if the trigger has drifted.** Re-verify all 5 parts of the trigger contract are present (Use when / Inputs / Do not use when / Produces / Escalate if).
5. **Update evidence tier and provenance if the foundation shifted.** Tier upgrades (H → P, P → E) require new source citations. Tier downgrades are allowed without new sources but should explain why.
6. **Re-run the verification mechanical checks** from `workflows/create.md` step 9.
7. **Update evals.** If `evals/trigger.csv` exists, refresh the prompts where the trigger changed. Add a near-miss for any new disqualifier you introduced.
8. **Update registry catalog `description:`** field if it exists and the frontmatter description changed (per `references/registry-integration.md`).
9. **Sync** if the catalog changed.
10. **Reviewer pass** — same rule as create. Mandatory before declaring done.
11. **Commit** with a message stating what changed and why (only if the registry is git-backed and the host workflow expects commits).

## Output

Report back to the user:
- Diff summary (which fields/sections changed)
- New evidence tier + provenance if changed
- Eval contract delta (prompts added/removed/changed)
- Reviewer pass status
