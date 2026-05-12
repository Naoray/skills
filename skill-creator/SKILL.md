---
name: skill-creator
description: Author or revise an AI-agent skill. Use when the user says "let's make a skill for X", invokes /skill-creator, asks to revise an existing SKILL.md, or wants to skill-ify a repeated workflow with 2+ prior invocations. Inputs - trigger phrase, artifact, evidence tier (E empirical / P practitioner / H heuristic). Do not use when the workflow is one-shot (write a snippet), is a phrasing trick or persona without a stable model, is an eval/benchmark loop (separate kit), or duplicates an existing skill (merge). Produces a skill directory with SKILL.md (5-part trigger description, lean body, no README/INSTALL/CHANGELOG) plus the registry-integration step for the active backend (see references/registry-integration.md). Escalate if no repeated workflow exists (suggest snippet), the model is H-tier with overreach ≥4 (manual-only), or the skill would compete with a stronger existing one (merge).
---

# Skill Creator

Package a repeated workflow as a triggerable artifact so future-agents find and execute the procedure without re-deriving it. The durable core — progressive disclosure, the 5-part trigger contract, evidence-tier honesty — is independent of which LLM or registry manager the user runs. Evidence tier of this skill itself: **P** (practitioner-backed). Treat as operating procedure derived from the Principled Framework for Curating AI-Agent Skills, not universal best practice.

## Fit gate — run BEFORE writing any file

Score the proposed skill against these checks. If 2+ are no, **do not create the skill**. Output the reason and the recommended alternative form (snippet, inline agent prompt, merge into existing skill, archive).

1. **Repeated workflow.** ≥2 prior real invocations exist. Not a one-shot.
2. **Stable artifact.** Same output shape across runs (a SKILL.md, a CSV, a diagram, a checklist, a refactored function).
3. **Durable cognitive model.** Domain model, standard, expert workflow, or validated heuristic — not just a phrasing trick or persona.
4. **Sharp trigger boundary.** Specific phrase or context, not "when the user wants something nice".
5. **Unique slot.** No existing skill in the registry covers it. Check the registry folder + catalog file (if one exists).
6. **Evidence tier declared.** E (empirical) / P (practitioner) / H (heuristic). See `references/evidence-tiers.md` for how to assign tier.
7. **Overreach risk acceptable.** The 5-part trigger contract can name a precise disqualifier. Risk score ≤3 on the Principled Framework 1-5 overreach axis (1 = narrow specific-phrase trigger; 5 = always-on prompt-recipe firing on broad surfaces), OR the skill is set to manual-invocation-only. See `references/evidence-tiers.md` for the full rubric.

Rubric overrides (from the Principled Framework):
- **Foundation strength ≤2 AND usage ≤2 → archive.** This is below the slot-earning threshold.
- **Uniqueness ≤2 BUT usage high → merge** into the existing canonical skill instead of creating a new one.
- **Risk of overreach ≥4 → manual invocation only.** Do not let it auto-trigger even if the composite score is high.

## Evidence tier shapes form and triggering

The Principled Framework warns: over-triggering behaves like alert fatigue. Tier is the proxy for "how often will this fire on a real-value task". Get the tier wrong and the skill becomes noise.

- **E-tier** (scientific debugging, plain-language guidance, accessibility standards, implementation intentions) → first-class skill or kit; default-trigger across broad contexts is safe.
- **P-tier** (code review heuristics, JTBD, premortems, Cynefin, OODA, TDD) → first-class skill or kit module; default-trigger **with explicit disqualifier** in description.
- **H-tier** (PAS, Rule of One, "5 whys", elevator-pitch templates) → snippet inside a kit; OR manual-invocation-only skill if it must stand alone. Heuristics belong low in the stack.

Form selection rule of thumb: **models belong high, heuristics belong low.** A model-backed workflow with sharp boundaries deserves its own skill. A heuristic with no domain model behind it deserves a snippet that lives under a stronger parent skill.

Declare the tier in the body's first paragraph so future-agents do not treat the skill as more authoritative than warranted.

See `references/evidence-tiers.md` for tier examples, the decision tree, and the family taxonomy.

## The 5-part trigger description

The frontmatter `description` is the only thing always in context. Body loads AFTER trigger, so every word that decides "should I fire" must live in the description. The contract has five parts, woven into one paragraph (do not use literal labels):

1. **Use when** — the trigger phrases a real user would say, including the artifact and phase.
2. **Inputs** — what the skill needs as context before it can start.
3. **Do not use when** — the disqualifier; the near-miss exclusions; the alternative form ("write a snippet instead").
4. **Produces** — the concrete artifact the skill emits.
5. **Escalate if** — when to stop and ask, not proceed.

Trigger before examples; precision over pushiness. "High-recall trigger phrasing + hard disqualifier" replaces "pushy" wording — pushiness without exclusions causes alert fatigue.

See `references/trigger-contract.md` for 4 worked examples (2 good, 2 bad) and a fill-in template.

## Authoring loop (target: 5–15 minutes per skill)

1. **Capture intent.** Pull from the current conversation if it contains a workflow ("turn this into a skill"). Otherwise interview the user — required: trigger phrase, artifact, ≥2 prior real invocations, evidence tier. Refuse to start without the prior invocations.
2. **Run the fit gate.** Output the result before any file work. Push back if it fails. If the rubric overrides fire, follow them (archive / merge / manual-only).
3. **Search the registry.** List existing skills and check the catalog file (if any) for name collisions and overlap (see `references/registry-integration.md` for the relevant locations per backend). If overlap is significant, propose merging.
4. **Draft the description first.** Write the 5-part trigger contract. Refuse to proceed if any part is empty. The description IS the skill; the body is operational detail after the trigger fires.
5. **Draft the body.** Imperative voice. Match the host's preferred style (caveman-lite, verbose, etc. — check the user's global rules). Explain WHY for every non-obvious rule. Target ≤200 lines; hard ceiling 500. If approaching 300, split by domain into `references/<topic>.md`.
6. **Decide bundled resources.** Add a script only if the same code would be rewritten ≥3 times. Add a reference only for >100-line domain content or 4+ worked examples. Add an asset only for an output template. When unsure, omit — leanness wins.
7. **Integrate with the registry manager.** Mandatory — without this the skill is invisible to other agents. Pick the active backend (`.claude/skills`, `~/.claude/skills`, `.ai/skills`, scribe, Codex, Gemini, Cursor, custom), follow the matching section in `references/registry-integration.md`, and run any required sync command. Safety note: if a project has `.ai/skills/`, writes to `.claude/skills/` may be hook-blocked — honor the convention.
8. **Verify.** Mechanical checks:
   - Folder name === frontmatter `name`
   - Frontmatter has `name` and `description`
   - Description contains all five trigger parts (re-read; check each)
   - Body has no MUST/ALWAYS/NEVER without an accompanying WHY clause
   - Evidence tier declared in the body's first paragraph
   - No `README.md`/`INSTALLATION.md`/`CHANGELOG.md`/`QUICK_REFERENCE.md` inside the folder
9. **Sync.** Run the registry manager's sync command if the catalog changed. Note explicitly if you skip it.
10. **Manual trigger check.** Show the user 2 should-trigger and 1 near-miss prompt; confirm the description would fire correctly. This replaces formal trigger evals — fast, sufficient for personal and small-team registries.
11. **Reviewer pass — mandatory before declaring done.** Ask a second agent (different model/provider when possible) or a human reviewer to audit the skill against this skill's own contract: fit gate passes, 5-part description complete, body ≤200 lines, no MUST/ALWAYS/NEVER without WHY, tier declared honestly, no leftover environment-specific assumptions in body. Block on unaddressed high-priority findings. Why: the author has tunnel vision after writing; a fresh-context reviewer catches stale examples, hardwired assumptions, and contract violations the author missed.

## Naming

- lowercase letters, digits, hyphens only
- ≤64 characters
- folder name === frontmatter `name`
- verb-led when the skill performs an action (`create-changelog-pr`, `evaluate-day`)
- namespace by tool only when triggering depends on it (`gh-*`, `linear-*`, `obsidian-*`)

The name is part of the trigger surface. Short verb-led names match how users actually phrase requests.

## Progressive disclosure rules

Three loading levels, in order of cost:

1. **Metadata** (`name` + `description`) — always in context across every agent invocation. ~100 words. Every token counts.
2. **Body** — loaded when the skill triggers. Target <200 lines; hard ceiling 500.
3. **Bundled resources** — loaded on demand. Unlimited size; scripts execute without loading.

If the body grows past 300 lines: split. Move detailed patterns or multi-domain content into `references/<topic>.md`. Add one-line pointers from the body. Reference files >100 lines need a TOC at the top.

The metadata is a public good shared with the system prompt, conversation history, and every other skill's metadata. Bloat anywhere taxes everywhere.

## Anti-patterns — what NOT to put in a skill

- **No `README.md`, `INSTALLATION_GUIDE.md`, `CHANGELOG.md`, `QUICK_REFERENCE.md`** inside the skill folder. The catalog entry is the discovery surface; folder docs are clutter the agent will not read.
- **No "pushy" trigger language** ("Make sure to use this skill whenever..."). High-recall trigger phrasing + a hard disqualifier replaces pushiness with precision.
- **No MUSTs / ALWAYS / NEVER without a WHY clause.** The model interprets unjustified rules as noise and routes around them.
- **No eval harness, benchmark scripts, HTML viewer, description optimizer.** Those belong in a separate kit. The manual trigger check (step 10) is enough for personal and small-team scale.
- **No scripts for tasks a shell one-liner or registry manager already handles.** Script maintenance compounds.
- **No persona/style/voice "skills" with no domain model behind them.** Those are snippets. A persona is not a contract.
- **No environment-specific paths in the body.** Keep paths generic (`<registry-root>`, `<project>`, `~/.claude/skills`). Move tool-specific recipes to `references/registry-integration.md`.
- **No tutorial padding.** The future agent is smart. Explain only what it does not already know.
- **No skills that auto-trigger when their evidence tier is H and overreach risk is ≥4.** Make those manual-only.

## Revising an existing skill

Same skill, different starting state:

1. Read the current `SKILL.md`.
2. Diff against the proposed change.
3. **Preserve** `name` and folder path. Do NOT create a `v2/` directory. Do NOT rename.
4. Update `description` if the trigger has drifted. Re-verify the 5 parts.
5. Re-run verify steps from the authoring loop.
6. If the registry has a separate catalog `description:` field, sync it.
7. Commit with a message stating what changed and why (only if the registry is git-backed and the host workflow expects commits).

## See also

- `references/trigger-contract.md` — 5-part contract template + 4 worked examples (good + bad)
- `references/evidence-tiers.md` — E/P/H definitions, decision tree, family taxonomy, rubric overrides
- `references/registry-integration.md` — backend-specific integration steps (scribe, .claude/skills, .ai/skills, custom)
- `assets/SKILL_TEMPLATE.md` — frontmatter + body scaffold with author checklist

## Lean v1 — open invitations to evolve

This skill is v1. Add the following ONLY when the underlying failure is observed ≥3 times in real use:

- `scripts/check_skill.sh` — shell validator (frontmatter shape, folder/name match, catalog entry present). Add when LLM verification misses real bugs.
- `references/progressive-disclosure.md` — detailed splitting heuristics with worked examples from real skills.
- `references/anti-patterns.md` — extracted anti-pattern catalog if the body's anti-pattern section grows past ~30 lines.

Do not add these proactively. Lean default.
