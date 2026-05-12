---
name: skill-creator
description: Author or revise an AI-agent skill. Use when the user says "let's make a skill for X", invokes /skill-creator, asks to revise an existing SKILL.md, or wants to skill-ify a repeated workflow with 2+ prior invocations. Inputs - trigger phrase, artifact, evidence tier (E empirical / P practitioner / H heuristic). Do not use when the workflow is one-shot (write a snippet), is a phrasing trick or persona without a stable model, is an eval/benchmark loop (separate kit), or duplicates an existing skill (merge). Produces a skill directory with SKILL.md (5-part trigger description, lean body, no README/INSTALL/CHANGELOG) plus the registry-integration step for the active backend (see references/registry-integration.md). Escalate if no repeated workflow exists (suggest snippet), the model is H-tier with overreach ≥4 (manual-only), or the skill would compete with a stronger existing one (merge).
---

# Skill Creator

Package a repeated workflow as a triggerable artifact so future-agents find and execute the procedure without re-deriving it.

**Evidence tier**: P (practitioner-backed)
**Basis**: Anthropic's `skill-creator`, OpenAI's `skill-creator`, and the *Principled Framework for Curating AI-Agent Skills* (5-part trigger contract, evidence tiers, kit/skill/snippet forms, rubric overrides), plus a two-pass counselor panel + ChatGPT Deep Research synthesis on multi-mode packaging, evals, lifecycle, and portability.
**Source IDs**: anthropics/skills, openai/skills, Naoray/skills, *Corpus2Skill* and *Navigation Paradox* on explicit routing, *Block skill-design* on skills-as-code.
**Reviewed**: 2026-05-12

Treat as operating procedure with sharp boundaries, not universal best practice.

## Fit gate — run BEFORE any file work

Score the proposed skill. If 2+ are no, do NOT create it. Output the reason and the recommended alternative form (snippet, inline agent prompt, merge into existing skill, archive).

1. **Repeated workflow.** ≥2 prior real invocations exist. Not a one-shot.
2. **Stable artifact.** Same output shape across runs.
3. **Durable cognitive model.** Domain model, standard, expert workflow, or validated heuristic — not a phrasing trick or persona.
4. **Sharp trigger boundary.** Specific phrase or context, not "when the user wants something nice".
5. **Unique slot.** No existing skill in the registry covers it. Check folder + catalog (see `references/registry-integration.md`).
6. **Evidence tier declared.** E / P / H — and **with provenance**: Basis, Source IDs, Reviewed date. See `references/evidence-tiers.md`.
7. **Overreach risk acceptable.** Risk score ≤3 on the Principled Framework 1-5 scale (1 = narrow phrase trigger; 5 = always-on prompt-recipe), OR set to manual-invocation-only.

Rubric overrides (apply at first hit, stop):
- Foundation ≤2 AND usage ≤2 → archive.
- Uniqueness ≤2 AND usage high → merge into the existing canonical skill.
- Overreach ≥4 (any tier) → manual invocation only. Do not auto-trigger.

## Evidence tier shapes form and triggering

Tier is not a label — it is a policy gate. See `references/evidence-tiers.md` for the deterministic 4-step selection (assign tier → score axes → apply overrides → choose form), the family taxonomy, and worked decision-tree examples.

- **E**: first-class skill or kit; default-trigger broad.
- **P**: first-class skill or kit module; default-trigger **with hard disqualifier**.
- **H**: snippet inside a kit, or manual-invocation-only standalone. Never auto-trigger H broadly.

Models belong high in the stack; heuristics belong low.

## Route

Read this file. Then read exactly one of:

- `workflows/create.md` — **draft** a new skill from a repeated workflow (fit gate → description → body → evals → verify). Stops at verified draft; hands off to `package.md` for release.
- `workflows/revise.md` — **draft a revision** to an existing skill (preserve `name` + path). Stops at verified revision; hands off to `package.md` for release.
- `workflows/evaluate.md` — run the `evals/trigger.csv` + `evals/checks.md` contract for one skill or the whole registry. Read this directly when auditing.
- `workflows/package.md` — **release** a verified draft or revision (sidecars, catalog wiring, sync, reviewer pass, manual trigger check, commit, PR). Always runs after `create.md` or `revise.md`.

Pick the one workflow that matches the user's intent. The draft → release split is deliberate — it keeps procedure out of the router and out of overlapping workflows (see the anti-pattern on duplicate mode logic below).

## Cross-cutting rules (apply across all workflows)

### Naming

- lowercase letters, digits, hyphens only
- ≤64 characters
- folder name === frontmatter `name`
- verb-led when the skill performs an action (`create-changelog-pr`, `evaluate-day`)
- namespace by tool only when triggering depends on it (`gh-*`, `linear-*`, `obsidian-*`)

### Progressive disclosure

Three loading levels:

1. **Metadata** (`name` + `description`) — always in context. ≤140 words. Every token counts.
2. **Body** — loaded when the skill triggers. ≤200 lines target, hard ceiling 500. Router-style `SKILL.md` ≤120 lines.
3. **Bundled resources** — loaded on demand. Unlimited size; scripts execute without loading.

If a single skill spans 3+ modes or the body crosses ~200 lines, split using the router pattern. See `references/multi-mode-skills.md`.

### Cross-tool portability

`SKILL.md` is tool-agnostic. Host-specific UI / paths / commands live in adjacent sidecars, not in the body. Generate sidecars; do not hand-maintain. See `references/portability.md` for the adapter pattern and `references/registry-integration.md` for per-backend paths.

### Lifecycle

Skills move through active → merge candidate → archived. Run a registry sweep quarterly or after any major model/tooling shift. See `references/lifecycle.md`.

## Anti-patterns — what NOT to put in a skill

- **No `README.md` / `INSTALLATION.md` / `CHANGELOG.md` / `QUICK_REFERENCE.md` as a sibling of `SKILL.md`.** The catalog entry is the discovery surface; folder docs are clutter the agent will not read. Nested READMEs inside `references/<subdir>/` ARE allowed when they are part of the retrieval surface.
- **No "pushy" trigger language** ("Make sure to use this skill whenever..."). High-recall trigger phrasing + a hard disqualifier replaces pushiness with precision.
- **No MUSTs / ALWAYS / NEVER without a WHY clause.** The model interprets unjustified rules as noise and routes around them.
- **No heavy eval harness** (HTML viewer, parallel-subagent benchmarks, automated description-optimization loops). The `evals/trigger.csv` + `evals/checks.md` contract is the default; add weight only if it pays rent.
- **No duplicate mode logic across router and workflows.** Procedure lives in one place: the workflow file. The router routes; it does not re-state.
- **No scripts for tasks a shell one-liner or registry manager already handles.**
- **No persona / style / voice "skills" with no domain model behind them.** Those are snippets.
- **No environment-specific paths in the body.** Move tool-specific recipes to `references/registry-integration.md` or `references/portability.md`.
- **No tutorial padding.** Future agent is smart. Explain only what it doesn't already know.
- **No skills that auto-trigger when their evidence tier is H and overreach risk is ≥4.** Make those manual-only (rubric override).

## See also

- `references/trigger-contract.md` — 5-part contract + 4 worked examples (good + bad)
- `references/evidence-tiers.md` — E/P/H definitions, deterministic 4-step selection, rubric overrides
- `references/multi-mode-skills.md` — router pattern, thresholds, anti-patterns
- `references/skill-evals.md` — `trigger.csv` + `checks.md` format, pass thresholds, what NOT to build
- `references/lifecycle.md` — active / merge candidate / archived states + cadence
- `references/portability.md` — sidecar adapter pattern (Codex / Cursor / Gemini)
- `references/registry-integration.md` — per-backend integration steps
- `assets/SKILL_TEMPLATE.md` — scaffold for non-router skills
- `assets/ROUTER_TEMPLATE.md` — scaffold for router skills with workflows/
- `evals/trigger.csv` — this skill's own trigger evals (20 prompts)
- `evals/checks.md` — universal must-pass checks (15 deterministic rules)
