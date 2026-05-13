Inherits skill-creator/evals/checks.md (C1–C15).

## Skill-specific checks

C16. **Six required sections in produced artefact.** Any `docs/NORTH_STAR.md` written by the derive or refresh workflow must contain headers (in any order): `Mission`, `Target users`, `Non-goals`, `Hard constraints`, `Decision principles`, `Success`. Why: the consult contract depends on the section shape; missing sections break delegate brief injection.

C17. **User-approval gate present in derive + refresh.** Both workflows must contain a literal "do NOT persist before <token>" rule and a single decision token (`approved` for derive, per-section approval for refresh). Why: without this, the artefact gets created from an unreviewed draft.

C18. **Consult workflow defines load() + inject() contracts.** `workflows/consult.md` must list both operations with their return shape, used by orchestrator-mode boot and dispatch.md brief templates. Why: the whole point of this skill is the propagation contract; if it's not specified, downstream consumers diverge.

C19. **No auto-derivation on orchestrator-mode boot.** SKILL.md anti-patterns must explicitly forbid silent file creation when the boot check finds no north star. Why: respects user-approval gate and avoids surprise file writes.
