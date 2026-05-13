# North-star template

Six sections. All required. Target total length ≤80 lines. Beyond that the artefact has become a roadmap; split it.

## Template (copy this into `docs/NORTH_STAR.md`)

```markdown
# Project north star — <project name>

> Last reviewed: YYYY-MM-DD by <author>.
> Source-of-truth for autonomous-agent decisions. When two valid paths fork, pick the one that serves the mission for the target users without violating non-goals or constraints; principles break remaining ties.

## Mission

<One sentence. Verb-led. What this project is for.>

## Target users / adopters

- <Concrete persona, role, or named adopter>
- <Second, if the project has more than one principal user type>

## Non-goals

- <Something a reasonable reader might assume IS a goal but isn't>
- <Second non-goal>
- <Third non-goal>

## Hard constraints

- **Tech:** <must run on X / must not depend on Y>
- **Legal / privacy:** <PII rules, license obligations>
- **Budget / perf:** <infra ceiling, latency target, binary size>
- **Compatibility:** <breaking-change rules, supported versions>

## Decision principles (priority-ordered)

1. **<Rule>** — Why: <one-line reason>. Beats: <what it overrides>.
2. **<Rule>** — Why: <…>. Beats: <…>.
3. **<Rule>** — Why: <…>. Beats: <…>.
   (3-7 total. More than 7 means none are load-bearing.)

## Success + anti-signals

**Going right:**
- <Concrete signal an agent could check in 6 months>
- <Second signal>

**Going wrong:**
- <Concrete anti-signal — if this is true, something has drifted>
- <Second anti-signal>
```

## Worked example — for this repo (`naoray/skills`)

```markdown
# Project north star — naoray/skills

> Last reviewed: 2026-05-13 by krishan.
> Source-of-truth for autonomous-agent decisions. When two valid paths fork, pick the one that serves the mission for the target users without violating non-goals or constraints; principles break remaining ties.

## Mission

Curate a small, reviewed set of agent skills that make Krishan's day-to-day Claude Code work faster, more reliable, and harder to derail.

## Target users / adopters

- Krishan, as primary author and daily user.
- Practitioners using Claude Code (and other tools via scribe sync) who adopt the registry as-is or as a fork.

## Non-goals

- Becoming a general-purpose skill marketplace. Curation > breadth.
- Capturing every workflow ever invoked once. Skills require ≥2 prior real invocations.
- Supporting every host. Cross-tool portability lives in sidecars; SKILL.md stays tool-agnostic but is not exhaustively tested on every backend.

## Hard constraints

- **Tech:** Skills are markdown + optional bundled resources; no compiled runtime, no host-specific paths in the body.
- **Legal / privacy:** No user PII in committed skills. No paid-API credentials.
- **Budget / perf:** SKILL.md ≤500 lines, router-style ≤120; description ≤140 words.
- **Compatibility:** Every skill must pass `skill-creator/evals/checks.md` C1–C15 before ship.

## Decision principles (priority-ordered)

1. **Skill description is the contract; body is implementation.** Why: description is always-in-context; body loads only on trigger. Beats: making the body comprehensive at description's expense.
2. **Models over heuristics.** Why: heuristics rot faster than durable cognitive models. Beats: convenient pattern-matching when a real workflow exists.
3. **Reviewer pass is mandatory before ship.** Why: stale examples, hardwired assumptions, and contract violations slip past the author. Beats: shipping velocity.
4. **Refuse to create when fit gate fails.** Why: every weak skill taxes every future invocation. Beats: being agreeable to a one-off request.

## Success + anti-signals

**Going right:**
- A new orchestrator session loads the right skills automatically and proceeds without preamble.
- Skill-creator output passes C1–C15 + reviewer on first attempt ≥80% of the time.
- A user can invoke a slash command and get the same artefact shape they got last week.

**Going wrong:**
- Skills are merged without evals or reviewer pass.
- Descriptions creep past 140 words to make the body shorter.
- The catalog grows faster than the user invocation rate.
```

## How to use this template

1. Copy the template block (the first fenced block) into `docs/NORTH_STAR.md`.
2. Fill placeholders. Resist the urge to add sections — the six are exhaustive.
3. Print to the user. Wait for approval. Persist only after.

## Sizing guidance

| Section | Target |
|---------|--------|
| Mission | 1 sentence |
| Target users | 1-3 bullets |
| Non-goals | 3-5 bullets |
| Hard constraints | 3-6 bullets across 4 categories |
| Decision principles | 3-7 numbered |
| Success + anti-signals | 2-4 each |

If your draft exceeds 80 lines total, the most likely culprit is principles with restated rationale or a "future roadmap" sneaking into mission. Cut.
