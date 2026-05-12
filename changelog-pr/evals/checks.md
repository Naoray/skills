Inherits skill-creator/evals/checks.md (C1–C15).

## Skill-specific checks

C16. **Output uses Keep a Changelog section names only.** Added / Changed / Deprecated / Removed / Fixed / Security. No custom section names. Empty sections are omitted. Why: Keep a Changelog is the contract this skill operationalizes; custom sections fork the spec and confuse downstream tooling that parses the file.

C17. **Squash-merge repositories use merged PR metadata as the source of truth, not SHA ancestry alone.** Why: SHA ancestry in squash-merge repos can over-report work already shipped in a previous release PR, leading to duplicate entries.

C18. **Manual sections in existing PR bodies are preserved on refresh.** Reviewer notes, rollout notes, checklist items, manual warnings, and issue links are kept verbatim. Only the generated changelog block is replaced. Why: clobbering hand-written content erodes trust in the skill and forces the user to re-derive context every release.
