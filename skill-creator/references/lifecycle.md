# Skill Lifecycle — active / merge candidate / archived

A registry without a lifecycle drifts. Skills accumulate. Duplicates appear. Outdated triggers stay live. This file defines the three-state lifecycle and the cadence for moving between states.

## The three states

### Active

- The skill is current and used. Its trigger fires on real-value tasks.
- Its evals pass (`workflows/evaluate.md` clean).
- It is listed in the registry catalog (`scribe.yaml` or equivalent).
- Quarterly review: confirm usage signals still justify the slot.

### Merge candidate

- Another skill covers an overlapping cognitive slot. Per the Principled Framework rubric override: **uniqueness ≤2 BUT usage high → merge**.
- The skill stays in the catalog while the merge is pending — moving things while live causes more confusion than waiting.
- Outcome: rename the surviving skill, move the merge candidate to archived with a `superseded_by:` field, update all references.

### Archived

- The skill no longer earns its slot. Per the rubric override: **foundation strength ≤2 AND usage ≤2 → archive**.
- The folder stays in the repository for git history.
- The catalog entry is removed.
- A tombstone is added: in the SKILL.md body, prepend `Status: archived 2026-MM-DD. Superseded by <skill-name> | Reason: <one-line>` so future-agents reading the file know.
- Do not delete the directory unless the folder itself is a security risk.

## Triggers for state transitions

### Active → Merge candidate

- A new skill overlaps the trigger surface of an existing skill.
- A reviewer flags duplicate-cognitive-slot during a `workflows/package.md` reviewer pass.
- A registry audit (Stage 9-style sweep) finds two skills firing on the same prompts.

### Active → Archived

- Usage signal flatlines for two consecutive review cycles.
- The underlying tool, model, or workflow has been retired.
- Foundation drops (e.g., the standard the skill operationalizes was withdrawn).

### Merge candidate → Archived (after merge complete)

- The merge has shipped. The surviving skill absorbed the trigger surface.
- The merge candidate's catalog entry is removed in the same commit.
- The tombstone is added.

### Archived → Active (rare, but allowed)

- The underlying workflow returns to relevance.
- A new author wants to revive the skill: they must re-run the full `workflows/create.md` fit gate from scratch, including new evals. Old evals are stale.

## Review cadence

- **Per-skill review**: every time the skill is revised (`workflows/revise.md` triggers it).
- **Registry sweep**: quarterly, OR after any major model/tooling shift (new agent host, new tool integration, breaking change to a key dependency).
- **Major-shift example**: when Claude Code, Codex, or Gemini ship a breaking change to skill loading, run a full sweep against `evals/checks.md`.

## What changes between states (in files)

| State | `SKILL.md` body | Catalog entry | `evals/` | Folder location |
|---|---|---|---|---|
| Active | normal | present | present | registry root |
| Merge candidate | adds `Status: merge-candidate <date>` line | present | present | registry root |
| Archived | adds `Status: archived <date>. Superseded by <name>` | **removed** | optional | registry root (history) |

## Archive / merge-candidate procedure (executable)

Run these steps in order. Each one is a concrete file edit or shell command, so two agents archiving the same skill produce the same result.

### Move active → merge candidate

1. **Edit `<skill>/SKILL.md`** body. Insert this line as the first paragraph (after the H1, before the evidence-tier line):
   ```
   Status: merge-candidate as of YYYY-MM-DD. Pending merge into <surviving-skill-name> — see <PR or scratchpad>.
   ```
2. **Leave the catalog entry in place.** The skill stays discoverable while the merge is pending.
3. **Keep `evals/` files.** They become regression coverage for the surviving skill after the merge.
4. **Reviewer pass**: file the merge proposal as a PR or scratchpad with the explicit `superseded_by` target. Don't move alone.

### Move merge candidate → archived (after merge complete)

1. **Edit `<skill>/SKILL.md`** body. Replace the `Status: merge-candidate` line with:
   ```
   Status: archived YYYY-MM-DD. Superseded by <surviving-skill-name>. Reason: <one line — overlap / low usage / standard withdrew>.
   ```
2. **Remove the catalog entry** from the registry catalog file (e.g., delete the `- name: <skill>` block in `scribe.yaml`). Commit catalog + body changes together.
3. **Delete or keep `evals/`** — delete if the surviving skill now owns the eval contract; keep as historical reference otherwise.
4. **Run the registry sync command** for the active backend (e.g., `scribe sync`, `php artisan boost:update`) so the archived skill stops propagating to other tools.
5. **Update any references** that point at the archived skill name. Grep the registry: `grep -r "<archived-skill-name>" .` and fix or remove each hit.
6. **Commit** with a message that names the surviving skill: `[agent] chore: archive <name>, superseded by <surviving-name>`.

### Move active → archived (no merge, no successor)

1. **Edit `<skill>/SKILL.md`** body — same `Status: archived YYYY-MM-DD` line as above, but without a `Superseded by` target. Reason becomes: `<low usage / standard withdrew / tool retired>`.
2. **Remove the catalog entry.**
3. **Delete `evals/`** — orphaned tests don't pay rent.
4. **Run the registry sync command.**
5. **Update references.**
6. **Commit** as `[agent] chore: archive <name>, no successor`.

### Move archived → active (rare, but allowed)

The old SKILL.md and evals are stale by definition. Treat revival as a fresh `workflows/create.md` run:

1. Re-run the fit gate. If it now passes, continue. If it still fails, leave archived.
2. Remove the `Status: archived` line from the body.
3. Add the catalog entry back.
4. **Re-author `evals/trigger.csv`** — the old prompts predate the disqualifier that was missing.
5. Run the sync command and a manual trigger check.
6. Note in the commit that this is a revival: `[agent] chore: revive <name> after <interval>`.

## Evidence tier of this pattern

**H** (heuristic). No published lifecycle framework for skill registries. Adjacent practitioner signals: graduating eval suites to regression (Anthropic), curation buckets `.curated` / `.system` (OpenAI), skills-as-code review treatment (Block). The state set above is local convention.

## Sources

- Anthropic evals guide — "capability evals can graduate into a regression suite."
- Block's skill-design post — skills get "same treatment as code."
- OpenAI skills repo root — visible lifecycle buckets.
- ChatGPT Deep Research synthesis on skill aging and lifecycle frameworks.
