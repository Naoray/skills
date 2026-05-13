---
name: north-star
description: Use when the user says `/north-star`, "set the north star", "what's our project compass", "lock in project direction", asks to derive a guiding principle an autonomous agent can decide by, or when `/orchestrator-mode` boots in a project without one and prompts to create one. Inputs - repo at cwd, signals (README, package manifests, CHANGELOG, recent commits, open issues, MemPalace wing=<project>), and a user decision-of-record on the draft before persist. Do not use when the user wants a sprint plan, OKRs, roadmap, milestone breakdown, feature scoping, or marketing brief; use planning, brainstorming, or strategy skills instead. Produces docs/NORTH_STAR.md (mission, target users, non-goals, hard constraints, decision principles, success + anti-signals) plus a mirror MemPalace drawer in wing=<project>. Escalate if conflicting direction docs already exist, the user has not approved the draft, or write access to docs/ or MemPalace is denied.
---

# North Star

Derive, persist, and propagate the project compass that an autonomous agent uses to make tradeoffs without re-asking the user.

**Evidence tier**: P (practitioner-backed)
**Basis**: Amplitude's North-Star Framework (one mission + leading indicators + non-goals); constitutional anchoring for agentic autonomy (Anthropic's constitutional-AI, OpenAI's spec-driven agents); Solo MCP + MemPalace durable-memory conventions used by `orchestrator-mode` in this registry.
**Source IDs**: amplitude.com/north-star, anthropic/constitutional-ai, naoray/skills `orchestrator-mode`, `orchestrator-handoff`, `references/state-surfaces.md`.
**Reviewed**: 2026-05-13

## Why this skill exists

`/orchestrator-mode` keeps asking the user "what matters here, what's the goal, can I act autonomously?" because no durable answer is loaded at boot. The fix is not a smarter orchestrator — it's a persisted artefact the orchestrator (and every delegate brief) reads automatically. North star is that artefact.

It is NOT a roadmap, sprint plan, or feature list. It is the decision rule: "when two valid paths fork, pick the one that serves <mission> for <users> without violating <non-goals> or <constraints>."

## The artefact — `docs/NORTH_STAR.md`

Six sections, all required. Full template + worked example: [references/template.md](references/template.md).

1. **Mission** — one sentence. Verb-led. What this project is for.
2. **Target users / adopters** — who. Specific enough to disqualify someone.
3. **Non-goals** — what this project explicitly will NOT do. Decision shortcuts.
4. **Hard constraints** — tech / legal / budget / perf / compatibility. Non-negotiable.
5. **Decision principles** — 3-7 priority-ordered rules. Used when constraints don't decide.
6. **Success + anti-signals** — what going right looks like; what going wrong looks like.

Stays under ~80 lines. If it grows past that, it's a roadmap — split it.

## Storage — two surfaces, one canonical

| Surface | Role | Loaded by |
|---------|------|-----------|
| `docs/NORTH_STAR.md` | Canonical. Versioned in repo. Survives without MCP. | Delegates in anvil worktrees; orchestrator after `cd <repo>`. |
| MemPalace drawer `north-star` in `wing=<project>` | Mirror. Cross-session anchor. | Orchestrator at boot before repo open; cross-project search. |

The repo file is source of truth. The MemPalace drawer mirrors it and references the file path. Never edit the drawer without updating the file; the consult workflow rejects drift.

Why both: delegates work inside isolated worktrees that may not have MemPalace MCP. Orchestrator may boot before any repo is open. Each surface covers a real gap.

## Route

Read this file. Then read exactly one of:

- [workflows/derive.md](workflows/derive.md) — **author** a north star by inspecting the project (no existing file). Inspection → draft → user signoff → persist both surfaces.
- [workflows/refresh.md](workflows/refresh.md) — **update** an existing north star. Delta-only — propose changed sections, user signoff per section, write back.
- [workflows/consult.md](workflows/consult.md) — **read** the north star and inject it into orchestrator-mode boot + every delegate brief. Read this when wiring downstream consumers.

## Cross-cutting rules

- **User-approval gate is non-negotiable.** A north star drafted without user signoff is a hallucination. Why: it becomes load-bearing for every downstream decision; an unreviewed draft poisons the well. Workflows must print the draft, wait for "approved" or per-section edits, then persist.
- **No silent file creation.** First write of `docs/NORTH_STAR.md` requires user confirmation of path. Why: some projects use `.github/`, `docs/specs/`, or `STRATEGY.md` instead; auto-creating the file conflicts with existing conventions.
- **Drift check on consult.** When `consult.md` loads the file, it diffs `mtime` of `docs/NORTH_STAR.md` vs the MemPalace drawer's last update. On drift, prompt the user to reconcile — never silently prefer one surface.
- **Delegate brief injection is automatic.** Every coding/slash-cmd brief template in `orchestrator-mode/workflows/dispatch.md` gets a `## Project north star` section auto-populated by consult. Delegates do not derive — they obey.
- **Refresh, don't append.** New decisions update relevant sections in-place. Append-only changelogs belong in `CHANGELOG.md`, not here.

## Anti-patterns

- **North star as feature roadmap.** Becomes stale every sprint; agent then ignores it. Mission + principles only — features go elsewhere.
- **No non-goals.** Without exclusions, every direction is "aligned" and the artefact decides nothing.
- **MUSTs without WHY.** Decision principles must include their rationale; an unjustified rule is rationalised away at the first hard tradeoff.
- **Persisting before approval.** A draft is not a north star. The user's "yes, that's right" is the persist trigger.
- **Embedding contents in every brief inline.** Delegates read the file path. Inline copies drift; the path stays canonical.
- **Auto-deriving on every `/orchestrator-mode` boot.** Boot CHECKS for existence; only PROMPTS if missing. Silent derivation creates files the user did not request.

## See also

- [references/template.md](references/template.md) — the artefact template + a worked example for a real project
- [workflows/derive.md](workflows/derive.md) — full inspection → draft → persist procedure
- [workflows/refresh.md](workflows/refresh.md) — delta-update procedure
- [workflows/consult.md](workflows/consult.md) — read + propagate procedure (orchestrator-mode boot, delegate brief injection)
- `orchestrator-mode/SKILL.md` — the primary consumer; boot step 1 invokes consult.md
- `orchestrator-mode/workflows/dispatch.md` — brief templates that auto-inject north star
- `orchestrator-mode/references/state-surfaces.md` — the broader state-storage convention
- `evals/trigger.csv`, `evals/checks.md`
