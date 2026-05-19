# Changelog

All notable changes to the `Naoray/skills` registry are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

The contract a registry user can lean on across versions:

- **Catalog entries** in `scribe.yaml` are stable — renames or removals are MINOR or MAJOR bumps and called out in this file.
- **Kit names** in `kits/<name>.yaml` are stable — renames are breaking changes.
- **Skill descriptions** (the 5-part trigger contract) may be sharpened in MINOR releases; the trigger semantics do not regress.
- **Skill body internals** (workflows, references, scripts) may change freely in MINOR releases.

## [Unreleased]

_Nothing yet._

## [0.1.0] — 2026-05-12

First tagged release. The registry now ships 15 skills bundled into 5 kits, every skill conformed to the skill-creator v2 contract.

### Added

- **5 kits** at `kits/<name>.yaml`, surfaced via `scribe.yaml` `kits:` block:
  - `daily-workflow` — `plan-my-day`, `evaluate-day`, `session-plan`, `record`, `meeting`
  - `release-pipeline` — `changelog-pr`, `code-review-artifacts`, `visual-review`, `cleanup`
  - `orchestration` — `orchestrator-mode`, `orchestrator-handoff`
  - `methodology` — `research-mode`, `skill-creator`
  - `mac-productivity` — `apple-calendar`, `dev-browser`
- **`skill-creator`** as the canonical authoring procedure (5-part trigger contract, evidence-tier gating, progressive disclosure, mandatory reviewer pass). LLM- and registry-agnostic. Ships with `evals/checks.md` (the deterministic C1–C15 audit) and `evals/trigger.csv`.
- **Per-skill `evals/`** — every catalog skill ships `trigger.csv` (routing eval) and `checks.md` (inherits C1–C15, augments with C16+ when domain-specific invariants apply).
- **Provenance blocks** in every SKILL.md body: evidence tier (E / P / H) + Basis + Source IDs + Reviewed date.

### Changed

- **README** rewritten with kits as the primary install path; theme→kit mapping in section headings; direct-response polish on the opener.
- **`orchestrator-mode`** body split from 492 lines to a 111-line router plus four workflows (`spec-formalization`, `review-and-merge`, `dispatch`, `hygiene`) and three references (`reporting-contract`, `state-surfaces`, `anti-patterns`).
- **`plan-my-day`, `session-plan`, `meeting`** bodies now use backend variables (`<context-root>`, `<meetings-root>`) instead of hardcoded `~/Context/` paths. Defaults documented in per-skill `references/paths.md`.
- **`cleanup`** body is agent-agnostic — Claude-specific terms (`subagents`, `AskUserQuestion`, `.claude/recaps/`, `.superpowers/`) moved into `references/registry-integration.md` with a multi-backend table covering Claude Code, Codex, Gemini.
- **`code-review-artifacts`** consolidates the former `flow-review` and `xray` skills.
- **`visual-review`** covers both browser UI and CLI/TUI review (formerly two separate skills).
- **`changelog-pr`** covers release PR bodies and `CHANGELOG.md` updates (formerly two separate skills).

### Removed

- `recap`, `recap-report` — workflow being rethought; intentionally not in the catalog.
- `scribe-agent` — scribe ships its own agent-facing skill; a registry-side duplicate violated the skill-creator "unique slot" gate.
- `flow-review`, `xray`, `create-changelog-pr`, `update-changelog`, `visual-review-cli` — consolidated into the merged skills above.

[Unreleased]: https://github.com/Naoray/skills/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Naoray/skills/releases/tag/v0.1.0
