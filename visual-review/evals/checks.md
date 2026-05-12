Inherits skill-creator/evals/checks.md (C1–C15).

## Skill-specific checks

C16. **Every output includes artifact paths AND the inspected routes / commands / viewports.** Why: a visual-review without an artifact path and scope statement is just a claim; the reviewer needs both the evidence and the scope to judge what the review covers and what it does not.

C17. **CLI captures use `termshot` for static command output and `vhs` for interactive TUIs.** Why: mixing tools (e.g., using `vhs` for static output) wastes time and produces lower-quality artifacts (gif overhead vs single PNG); the tool choice is determined by whether terminal motion matters.

C18. **PR-mode runs in an isolated worktree, not the user's checkout.** Why: PR review may install dependencies and start dev servers; doing this on the user's working branch risks contaminating their local state.
