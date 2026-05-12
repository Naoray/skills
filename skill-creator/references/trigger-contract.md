# Trigger Contract — 5-Part Description Pattern

The `description` in a skill's YAML frontmatter is the **only thing always in context** across every agent invocation. It is the contract that decides whether the skill fires. Body content is not part of the trigger decision — it loads after the trigger has already fired.

## The five parts

Weave these into a single paragraph in the order below. Do not use literal labels in the final description; readability beats schema fidelity. But every part must be present and identifiable.

1. **Use when** — the artifact-in-phase-needs-transformation phrasing, including realistic user trigger phrases. Be specific. "When the user wants to ship code" is weak; "when the user says 'ship it', 'create a PR', 'merge to main', or asks to bump a version" is strong.
2. **Inputs** — what the skill needs in hand before it can start. Without this, the skill triggers and then has to interview the user, which wastes turns.
3. **Do not use when** — the hard disqualifier. The near-miss exclusions. The alternative form (snippet, inline prompt, merge into another skill). Without this, the skill overreaches.
4. **Produces** — the concrete artifact the skill emits. A SKILL.md? A CSV? A diagram? Stating the artifact lets the agent match the request shape.
5. **Escalate if** — when to stop and ask the user instead of proceeding. Missing evidence, irreversible action, security boundary, ambiguous scope.

## Fill-in template

```
[Use-when phrasing with concrete trigger phrases]. Inputs needed: [list 2–4 required pieces of context]. Do not use when [disqualifier 1], [disqualifier 2], or [disqualifier 3] — [recommended alternative form]. Produces [concrete artifact with format constraints]. Escalate if [condition 1] or [condition 2].
```

## Worked example 1 — GOOD (this skill's own description)

```yaml
description: Author or revise an AI-agent skill (SKILL.md + optional bundled scripts/references/assets). Use when the user says "let's make a skill for X", invokes /skill-creator, asks to revise an existing SKILL.md, or wants to skill-ify a repeated workflow with 2+ prior real invocations. Inputs needed - a concrete trigger phrase, the artifact the skill produces, the evidence tier of the underlying model (E empirically-backed / P practitioner-backed / H heuristic), and the prior invocations that prove repetition. Do not use when the workflow is one-shot (write a snippet or inline agent prompt instead), the task is a phrasing trick or persona without a stable model, the work is an eval/benchmark loop (separate kit), or the proposed skill would duplicate an existing one in the registry (merge instead). Produces a skill directory containing SKILL.md (frontmatter with name + 5-part trigger description, body under 500 lines, no README/INSTALL/CHANGELOG inside), optional bundled resources justified by repeated work, and the integration step for whatever registry manager is in use (scribe, project-local .claude/skills, ~/.claude/skills, .ai/skills, etc.). Escalate if no repeated workflow exists yet (push back, suggest snippet), the underlying model is H-tier with overreach score ≥4 (recommend manual invocation only), or the skill would compete with a stronger existing one (merge instead).
```

Why it works: Real trigger phrases listed. **Inputs include both the fit-gate gate (`2+ prior real invocations`) and the evidence tier (E/P/H)** — the tier becomes a hard input, not an afterthought. Disqualifiers name the alternative form (snippet, kit, merge). Artifact is concrete but registry-agnostic — "the integration step for whatever registry manager is in use" lists scribe + .claude/skills + .ai/skills as peer options, not assumed defaults. Escalation conditions are tier-aware (H-tier + overreach → manual-only).

## Worked example 2 — LEGACY ACCEPTABLE (xray skill, pre-5-part-contract)

```yaml
description: Use when the user wants to understand how their codebase works, see execution flows as ASCII diagrams, review architecture after shipping features, or says "xray", "show me the flows", "what does this app actually do", "architecture review". Proactively suggest after 3+ PRs merged since last run.
```

What it does well: Concrete user phrases. Trigger phase named ("after shipping features"). Proactive condition stated with a measurable threshold.

**Why this is NOT template-grade**: missing an explicit "do not use when" disqualifier and missing "produces" + "escalate if" clauses. The skill predates the 5-part contract. It still works in practice because the trigger phrasing is narrow and the proactive condition has a numeric gate, but a new skill should NOT copy this shape. Use Worked Example 1 (skill-creator's own description) as the template instead. If you revise xray, add the missing clauses.

## Worked example 3 — BAD (overreach pattern)

```yaml
description: A comprehensive guide for writing better code. Use this skill whenever you are about to write, edit, or review code. Make sure to apply these principles to all programming tasks. Especially useful for new developers and code reviews.
```

Why it fails:
- "Whenever you are about to write code" = always-on trigger, alert fatigue.
- No artifact specified — what does it produce?
- No inputs — the skill triggers and then has to figure out what the user wants.
- No disqualifier — when is it inappropriate?
- "Make sure to apply these principles" = unjustified MUST.
- "Comprehensive guide" suggests a tutorial, not a procedure.

Fix: name the artifact (a reviewed PR? a refactored function? a style audit?), name the trigger phrase, add a hard disqualifier ("Do not use for one-line bugfixes — too heavyweight").

## Worked example 4 — BAD (vague persona pattern)

```yaml
description: Channel a 10x senior engineer. Use when you want high-quality opinionated technical decisions. Provides expert-level architectural guidance.
```

Why it fails:
- "Channel a 10x engineer" is a persona, not a contract.
- "High-quality opinionated decisions" is unmeasurable.
- No artifact, no inputs, no disqualifier, no escalation rule.
- This is a phrasing trick, not a skill. Should be a snippet or inline prompt.

Fix: either delete (it's a vibe, not a skill) or convert to a snippet referenced from a kit. If it must be a skill, name the actual procedure: "Use when reviewing an architecture decision record. Inputs: ADR draft + 2 alternative options considered. Produces: a marked-up critique listing trade-offs, risks, and a final recommendation. Do not use when the decision is reversible or one-week-scoped — write inline instead."

## Final-check checklist

Before saving the description, verify:

- [ ] At least 2 concrete trigger phrases the user might actually say
- [ ] Required inputs listed
- [ ] Hard disqualifier present, with alternative form named
- [ ] Artifact named in concrete terms (file type, shape, content)
- [ ] At least one escalation condition
- [ ] No "pushy" filler ("be sure to", "make sure", "always use")
- [ ] No MUSTs without WHYs
- [ ] Single paragraph; readable; matches the voice of existing registry skills
