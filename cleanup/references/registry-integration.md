# cleanup — backend-specific paths

The skill body is agent-agnostic. Concrete scan locations and prune targets vary by tooling stack and live here.

## Pass A — plan & spec scan locations

| Backend | Locations |
|---|---|
| Claude Code + superpowers | `.superpowers/**/*.md`, `docs/superpowers/**/*.md` |
| Project-root convention | `PLAN.md`, `SPEC.md`, `DESIGN.md`, `TODO.md` |
| Repo-wide pattern | `**/*.plan.md`, `**/*.spec.md` |
| Codex | `docs/plans/**/*.md` (most common) |
| Gemini CLI | `docs/plans/**/*.md`, `plans/*.md` (Gemini has no dedicated plans dir — falls back to repo convention) |

For each found file: extract checklist completion via `- [x]` / `- [ ]` counts. Treat 100% checked as "fully implemented"; <100% with recent commits as "active"; <100% with no commits in 30+ days as "abandoned".

## Pass B — tool-rules files

| Backend | Path |
|---|---|
| Claude Code | `.claude/rules/*.md`, `CLAUDE.md` |
| Codex / open-source agents | `AGENTS.md`, `.aiderules`, `.aider.conf.yml` |
| Gemini CLI | `GEMINI.md` |

Flag (don't delete) when a rules file references frameworks/tools no longer in dependencies. The user typically wants to update the init/ruleset, not remove it.

## Pass C — session artifact locations

| Backend | Location | Stale threshold |
|---|---|---|
| Claude Code | `~/.claude/projects/<slug>/` (per-project caches) | 30 days |
| Claude Code recaps | `~/.claude/recaps/<project-slug>/` | 30 days |
| superpowers session artifacts | `.superpowers/sessions/` | 30 days |
| Scribe-managed canonical store | `~/.scribe/skills/<name>/` | never auto-prune (managed by `scribe sync`) |
| MemPalace local cache | `~/.mempalace/` | never auto-prune |

Stale thresholds are conservative defaults. If the user prefers a different cutoff, honor it.

## Step 4.4 — prune commands

After confirmation:

```bash
# Stale Claude recaps (>30d)
find ~/.claude/recaps/<project-slug>/ -type f -mtime +30 -print -delete 2>/dev/null

# Stale superpowers session artifacts (>30d)
find .superpowers/sessions/ -type f -mtime +30 -print -delete 2>/dev/null
```

Run with `-print` first if the user wants a dry-run.
