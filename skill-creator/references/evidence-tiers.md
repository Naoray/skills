# Evidence Tiers — How Foundation Strength Shapes Skill Design

Three tiers from the *Principled Framework for Curating AI-Agent Skills*. The tier you assign drives three downstream decisions: **whether the skill earns a slot, what form it takes (kit / skill / snippet), and how aggressively it can auto-trigger**.

## Table of contents

- [Tier definitions](#tier-definitions)
- [Decision tree — tier × usage × overreach](#decision-tree)
- [Skill family taxonomy](#skill-family-taxonomy)
- [Rubric overrides (apply during fit gate)](#rubric-overrides)
- [Declaring the tier in the skill body](#declaring-the-tier)
- [Anti-patterns by tier](#anti-patterns-by-tier)

## Tier definitions

### E — Empirically backed

Field has explicit models, validated standards, or meta-analytic support. The procedure has been studied, codified, and shown to work better than alternatives in published evidence.

Examples:
- **Scientific debugging** (hypothesis → instrumentation → experiment → fix → regression check) — extensive research on developer debugging as a structured diagnostic process.
- **Plain-language guidance** — reliably improves comprehension and usability across audiences.
- **Accessibility standards** (WCAG, ARIA) — explicit, testable, version-controlled by standards bodies.
- **Implementation intentions** ("when X happens, I will do Y") — robust empirical support for behavior change.

Triggering posture: **default-trigger across broad contexts is safe.** The model is stable enough that frequent firing is high-value. Overreach risk is naturally low because the procedure is well-defined.

Form: usually **first-class skills or kits**.

### P — Practitioner-backed

Coherent framework with broad expert adoption, lighter on causal evidence. The procedure is widely used and refined by practitioners, but empirical validation is mixed, case-based, or domain-bounded.

Examples:
- **Code review heuristics** (functionality, tests, readability, maintainability, security passes) — strong practitioner consensus, evidence on review value beyond defect-finding.
- **Jobs-to-be-Done** — well-established product framing method, evidence is largely case-based.
- **Premortems** (prospective hindsight on a planned action) — moderate empirical support.
- **Cynefin / OODA** — useful practitioner lenses, less proven as causal interventions.
- **TDD** — quality benefits are evidenced, productivity benefits are mixed and context-sensitive.

Triggering posture: **default-trigger with explicit disqualifier in description.** The framework is real, but boundaries need policing — the 5-part trigger contract carries the weight.

Form: **first-class skill or kit module.**

### H — Useful heuristic

Specific tip, formula, or rule of thumb with practitioner uptake but thin causal evidence. Often a writing pattern, a quick check, or a folk wisdom shortcut.

Examples:
- **PAS** (Problem-Agitate-Solve) copywriting formula.
- **Rule of One** — narrow a piece of writing to one audience, one message, one CTA.
- **"5 whys"** root-cause framing.
- **Elevator pitch templates**.
- **Eisenhower matrix** for prioritization (when used as a rule rather than a method).

Triggering posture: **snippet inside a kit**, OR **manual-invocation-only skill** if it must stand alone. Heuristics fire on too many surfaces if let loose — alert fatigue is the failure mode.

Form: **snippets > standalone skills.**

## Decision tree — deterministic 4-step selection

Run these in order. Stop at the first rule that fires.

### Step 1 — Assign tier

E / P / H based on the tier definitions above. If you can't pick confidently, default DOWN one tier — honest underclaiming beats overclaiming.

### Step 2 — Score usage, foundation, overreach

Rate each 1-5 on the Principled Framework rubric:

- **Usage**: how often the trigger fires on a real-value task (1 = rarely, 5 = weekly+)
- **Foundation strength**: 1 = pure prompt recipe, 5 = standard/mature science. Should align with the tier you assigned: E → 4-5, P → 3-4, H → 1-3.
- **Overreach risk**: 1 = narrow specific-phrase trigger, 5 = always-on prompt-recipe

### Step 3 — Apply rubric overrides (stop at first hit)

| Override | Action |
|---|---|
| Foundation ≤2 AND usage ≤2 | **Archive.** Below slot-earning threshold. |
| Uniqueness ≤2 AND usage high | **Merge** into existing canonical skill. |
| Overreach ≥4 (any tier) | **Manual invocation only.** Do not auto-trigger. |
| Tier = H AND must stand alone | **Manual invocation only.** Never auto-trigger H-tier broadly. |

### Step 4 — Choose form (if no override fired)

| Tier | Usage | Form | Triggering |
|---|---|---|---|
| E | high | first-class skill or kit | default-trigger |
| E | low | consider snippet (may not earn slot) | — |
| P | high or low, low overreach | first-class skill or kit module | default-trigger + hard disqualifier |
| P | high, high overreach | first-class skill | manual-invocation only |
| H | high | snippet inside a parent kit | (snippet — no independent trigger) |
| H | low | archive, or inline prompt | — |

Output the chosen form + triggering posture as part of the fit-gate result.

## Skill family taxonomy

The Principled Framework identifies six families with characteristic tiers. Use this to sanity-check your tier assignment:

| Family | Typical tier | Examples |
|---|---|---|
| Diagnostic inquiry / scientific debugging | E | bug-fix kits, root-cause analysis |
| Review and quality control | E to P | code review, accessibility audit, design review |
| Planning and decision-making under uncertainty | E to P | premortems, implementation intentions, Cynefin triage |
| Product discovery and strategy | P | JTBD, Wardley mapping |
| Writing and persuasion | E to H | plain-language strong (E), PAS / Rule of One weaker (H) |
| Personal workflow and reflective practice | E to P | after-action review, decision logs, cognitive offloading |

If the proposed skill doesn't fit a family, that itself is a signal — re-check whether it's a real model or a phrasing trick.

## Rubric overrides

These overrides come from the Principled Framework rubric and override the composite score during the fit gate:

- **Foundation strength ≤2 AND usage ≤2 → archive.** Below the slot-earning threshold. The skill is a prompt recipe, not a model-backed contract.
- **Uniqueness ≤2 BUT usage high → merge** into the existing canonical skill. Two skills covering the same cognitive slot create discovery confusion and maintenance drag.
- **Risk of overreach ≥4 → manual invocation only.** Do not let the skill auto-trigger even if the composite score is high. The user opts in explicitly.

The overrides matter because composite scoring can mask a fatal flaw. A high-usage low-foundation "skill" still scores well on usage and uniqueness — but it's noise. The overrides catch that.

## Declaring the tier

Add a sentence to the skill body's first paragraph:

> Evidence tier: **P (practitioner-backed)** — derived from the code-review literature and Anthropic's own review heuristics. Treat as operating procedure with sharp boundaries, not universal best practice.

Honest labeling does two things:
1. Future-agents do not treat the skill as more authoritative than warranted.
2. The label becomes a maintenance signal — if the tier was wrong (E claimed but really H), it will show up in failures, and the next reviser can downgrade.

## Anti-patterns by tier

- **E-tier skill written without naming the standard or model.** If the skill is empirically backed, cite the model (WCAG version, the procedure name). Otherwise it reads like vibes.
- **P-tier skill without a disqualifier in the description.** Practitioner frameworks are precisely where boundary-policing matters most.
- **H-tier skill that auto-triggers broadly.** Maximum alert-fatigue risk. Convert to snippet or manual-only.
- **Skill claiming E-tier without evidence.** Self-aggrandizement bloats the registry and erodes trust in the tier labels overall. Be honest. Most personal skills are P or H.

## Reading list (out-of-scope summaries from the Principled Framework)

- Transfer / deliberate practice / implementation intentions — E-tier procedural foundations.
- Code review and accessibility standards — strongest engineering foundations.
- Cynefin / OODA / JTBD / Wardley — useful P-tier lenses, not causal laws.
- PAS / Rule of One / formulaic copy — H-tier; demote to snippet under a stronger writing kit.
