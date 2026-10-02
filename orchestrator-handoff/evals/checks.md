Inherits skill-creator/evals/checks.md (C1–C15).

## Skill-specific checks

C16. **Read-only handoff** — instructions must not stop agents, archive scratchpads, close processes, merge PRs, or mutate repo state. Why: handoff preserves state for the next orchestrator.

C17. **Reuse current handoff** — an existing handoff ID is updated with a revision guard; changing date or orchestrator does not require a new pad. Preserve sole-copy evidence before replacement and retain exact live ownership and unresolved gates.
