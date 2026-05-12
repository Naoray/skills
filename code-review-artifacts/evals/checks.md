Inherits skill-creator/evals/checks.md (C1–C15).

## Skill-specific checks

C16. **Every output includes an explicit "Inspected / Not inspected" scope statement.** Why: review artifacts read as authoritative even when narrow; without an explicit scope gap the reviewer cannot tell which approval risks the artifact covered and which it did not.

C17. **Flow-map and x-ray diagrams mark changed steps with `[NEW]`, `[MOD]`, or `[REMOVED]` markers.** Why: an unmarked diagram of a changed codebase tells the reviewer the structure but hides where to look during review — the whole reason the artifact exists.

C18. **Diff-brief risk findings categorize by High / Medium / Low.** Why: undifferentiated lists of "issues" force the reviewer to re-prioritize; the artifact's job is to triage.
