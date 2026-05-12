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
- **Major-shift example**: when Claude Code, Codex, Cursor, or Gemini ship a breaking change to skill loading, run a full sweep against `evals/checks.md`.

## What changes between states (in files)

| State | `SKILL.md` body | Catalog entry | `evals/` | Folder location |
|---|---|---|---|---|
| Active | normal | present | present | registry root |
| Merge candidate | adds `Status: merge-candidate <date>` line | present | present | registry root |
| Archived | adds `Status: archived <date>. Superseded by <name>` | **removed** | optional | registry root (history) |

## Evidence tier of this pattern

**H** (heuristic). No published lifecycle framework for skill registries. Adjacent practitioner signals: graduating eval suites to regression (Anthropic), curation buckets `.curated` / `.system` (OpenAI), skills-as-code review treatment (Block). The state set above is local convention.

## Sources

- Anthropic evals guide — "capability evals can graduate into a regression suite."
- Block's skill-design post — skills get "same treatment as code."
- OpenAI skills repo root — visible lifecycle buckets.
- ChatGPT Deep Research synthesis on skill aging and lifecycle frameworks.
