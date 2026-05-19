# Workflow — Package a skill for release

Read `references/registry-integration.md` for backend-specific commands. Read `references/portability.md` if generating per-tool sidecars.

This workflow runs after `workflows/create.md` (or `workflows/revise.md`) has produced a working skill that passes its evals. It handles the final integration steps: sidecar generation, catalog wiring, sync, and the reviewer pass.

## Steps

1. **Generate machine-facing sidecars** for any host that needs them, per `references/portability.md`:
   - **Codex**: `agents/openai.yaml` with `display_name`, `short_description`, `default_prompt`. Generate from `SKILL.md` content — do not hand-maintain.
   - **Gemini**: optional `.gemini/commands/<name>.toml` adapter if the skill should be invocable as a slash command in Gemini CLI.

   Skip sidecars the user doesn't actively use.

2. **Wire the catalog** for the active registry backend. The most common patterns:
   - **scribe**: append `- name: <skill-name>` + `source:` under `catalog:` in `scribe.yaml`. Add a catalog `description:` only when the frontmatter description is long and a terse browse blurb helps.
   - **Project-local `.claude/skills/`**: nothing to do; auto-discovered.
   - **User-global `~/.claude/skills/`**: nothing to do; auto-discovered.
   - **Laravel Boost `.ai/skills/`**: run `php artisan boost:update`.

3. **Run the sync command** for the active backend (`scribe sync`, `php artisan boost:update`, or equivalent). Note explicitly if you skip it.

4. **Reviewer pass — mandatory before declaring done.** Per `SKILL.md` step 11. Ask a second agent (different model/provider when possible) or a human reviewer to audit the skill against the skill-creator contract:
   - Fit gate passes
   - 5-part description complete
   - Body ≤200 lines target, no MUST without WHY
   - Evidence tier + provenance declared honestly
   - Eval contract exists and includes near-miss negatives
   - No sibling `README.md` / `INSTALLATION.md` / `CHANGELOG.md` inside the folder
   - No leftover environment-specific assumptions in body

   Block on unaddressed high-priority findings.

5. **Manual trigger check** with the user (replaces formal trigger evals only when no `evals/trigger.csv` exists yet). Show 2 should-trigger + 1 near-miss prompt; confirm correct firing.

6. **Commit** (only if the registry is git-backed and the host workflow expects commits). Stage specific files by name; never use `git add .` or `git add -A`. Use `[agent]` prefix in the commit message per the user's global discipline if they have one.

7. **Open PR** (if the registry is git-backed and PRs are the integration path). PR body MUST describe what the skill does, why now, what was reviewed, and the eval contract summary. Empty PR bodies on multi-file skill changes invite review-fatigue rejection.

## Output

Report back to the user:
- Sidecars generated (which hosts)
- Catalog entry (path + diff snippet)
- Sync command run (or skipped + reason)
- Reviewer pass result
- Commit SHA(s) and PR URL if applicable
