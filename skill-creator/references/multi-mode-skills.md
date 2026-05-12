# Multi-mode skills — router pattern + thresholds

Some skills have more than one mode (e.g., `changelog-pr` has Create / Refresh / Update; `code-review-artifacts` has Diff brief / Flow map / X-ray). The right structure depends on how the modes relate.

## Three valid shapes

| Shape | When to use | Cost |
|---|---|---|
| **Inline branching** in a single `SKILL.md` | 2 modes, same prerequisites, total body ≤120–150 lines | Lowest |
| **Router `SKILL.md` + `workflows/<mode>.md`** | 3+ modes, OR body would cross ~200 lines, OR one mode needs a second deep read | Medium |
| **Separate skills under a kit / loadout** | Modes have different auto-trigger phrases, different tools, different safety boundaries, or distinct "produces" clauses | Highest |

These are heuristic thresholds (evidence tier H). The signal that triggered the boundary in real use: when the agent has to ask "which mode?" before reading anything else, you've crossed into router territory.

## The router pattern

A router `SKILL.md` is a tiny file (≤120 lines) that does four things:

1. Carries the frontmatter (5-part trigger description) for the whole skill.
2. States the fit gate inline (one paragraph).
3. Declares the evidence tier + provenance.
4. Routes to exactly one workflow file with a `## Route` section.

Workflows live in `workflows/<mode>.md`. Each one is single-purpose. They:

- Open with `Read this file.` (state the entry condition)
- List the references they need
- Run their step sequence
- Report output

### Example `## Route` section

```markdown
## Route

Read this file. Then read exactly one of:

- `workflows/create.md` — new skill from a repeated workflow
- `workflows/revise.md` — existing skill drift / fix / merge
- `workflows/evaluate.md` — run the trigger.csv + checks.md eval contract
- `workflows/package.md` — sidecars, catalog wiring, sync, reviewer pass, PR
```

The router section's job is to make the next read unambiguous. List one file per mode. Use per-link conditions, not just filenames.

## Anti-patterns

- **Router that duplicates workflow logic.** If the steps live in both `SKILL.md` and `workflows/<mode>.md`, drift is guaranteed. Keep procedure in workflows only.
- **Router with overlapping mode descriptions.** If two `Route` bullets could both fire, your modes aren't actually distinct — rethink.
- **Router that grows past ~120 lines.** That's a body, not a router. Move shared rules into a reference or back into per-workflow files.
- **Generic "see references/" pointers** instead of per-mode routing. The router section must name the specific file for each branch.

## Evidence tier of this pattern

**P** (practitioner-backed). Strong practitioner guidance from Anthropic and OpenAI skill-creators, plus emerging benchmarks on explicit-routing > implicit-retrieval in long-context settings (Corpus2Skill, Navigation Paradox). No public A/B comparison at personal-registry scale; the threshold values above are heuristic.

## Sources

- Anthropic skill-creator SKILL.md — "Domain organization: when a user asks about sales metrics, Codex only reads sales.md."
- OpenAI skill-creator SKILL.md — "core workflow + selection guidance".
- ChatGPT Deep Research synthesis on multi-mode skill packaging (this registry, May 2026).
