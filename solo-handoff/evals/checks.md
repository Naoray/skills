Inherits skill-creator/evals/checks.md (C1–C15).

## Skill-specific checks

C16. **No destructive lifecycle** — instructions must not stop or close running agents, and must not close the session's own process unless the user says so. Why: the handoff redirects agents; it never ends their work.
C17. **No claimed successor without a spawn result** — the skill must not report a successor before `spawn_agent` returned its process id. Why: a false "successor is running" left a real session stranded once.
C18. **Redirect before reporting** — running agents are told the successor's id before the skill reports done. Why: otherwise their reports keep reaching the old session.
