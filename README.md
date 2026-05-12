# Naoray/skills

**15 production-grade skills for Claude Code, Cursor, and Codex.** Each one earned its slot against a deterministic 15-check audit, ships with router/structure evals, and declares its evidence tier upfront — so you know whether it's empirical, practitioner-backed, or heuristic before you install.

Install one. Install the catalog. Built for [Scribe](https://github.com/Naoray/scribe), works without it.

```bash
scribe registry connect Naoray/skills
```

## The five themes

1. **Daily workflow** — `plan-my-day`, `evaluate-day`, `session-plan`, `record`, `meeting`. Plan the day, capture what happens, close the loop — without leaving the agent.
2. **System & web integration** — `apple-calendar`, `dev-browser`, `cleanup`. Drive Calendar.app, automate a real browser, prune project artifacts after a ship.
3. **Release pipeline** — `changelog-pr`, `code-review-artifacts`, `visual-review`. PR bodies, comprehension diagrams, and rendered-output verification on the way to merge.
4. **Multi-agent orchestration** — `orchestrator-mode`, `orchestrator-handoff`. Coordinate parallel agents over [Solo MCP](https://github.com/sublayerapp/solo); hand state to the next session before the context window collapses.
5. **Methodology** — `research-mode`, `skill-creator`. Anti-hallucination citation discipline; author your own skills using the 5-part trigger contract and evidence-tier gating.

## What's inside

### Daily workflow

- **`plan-my-day`** — Fuse your calendar, reminders, and intent into a reviewed time-block schedule and a daily-note scaffold. Asks before it touches the calendar.
- **`evaluate-day`** — Turn today's Running Log into a grounded end-of-day reflection inside the daily note. Won't overwrite without confirmation.
- **`session-plan`** — A focused practice/work block with one main outcome, timed sub-blocks, and an explicit "ignore this today" list. Reads persistent domain context from `~/Context/<domain>/`.
- **`record`** — `/record <message>` appends one deduplicated, timestamped entry to today's Running Log. Used by the other skills as their event-capture primitive.
- **`meeting`** — Live note capture while a meeting is active. `/meeting <title>` opens a session; every later message becomes raw notes, decisions, and action items until `/meeting end`.

### System & web integration

- **`apple-calendar`** — Calendar.app CRUD on macOS: list, create, update, delete, search; handles recurrence safely. Direct AppleScript — no Google/Outlook bridging.
- **`dev-browser`** — Persistent-page browser automation for QA, scraping, and login flows. Headless Chromium with state survival across commands. Refuses destructive or payment actions without explicit consent.
- **`cleanup`** — Post-ship project hygiene. Classifies artifacts as remove / update / keep / review, applies changes only after you confirm. Not a disk-space tool.

### Release pipeline

- **`changelog-pr`** — Generate or refresh a release PR body and `CHANGELOG.md` in Keep a Changelog format. Detects squash vs merge style; emits only the sections that have entries.
- **`code-review-artifacts`** — Diff briefs, ASCII flow maps, architecture x-rays. Comprehension artifacts for reviewers and AI agents about to touch unfamiliar code. Every artifact carries an explicit "Inspected / Not inspected" scope line.
- **`visual-review`** — Rendered-output verification across browser pages, PRs, CLI commands, and TUIs. Captures screenshots/recordings plus a visible-issues report. Read-only — never commits.

### Multi-agent orchestration

- **`orchestrator-mode`** — Convert the current session into a delegating coordinator over [Solo MCP](https://github.com/sublayerapp/solo). Sets agent-selection rules (codex for coding, claude for skills/slash-commands, gemini for second-opinion), worktree-by-default isolation, and scratchpad-based feedback capture.
- **`orchestrator-handoff`** — A paste-ready prompt for the next orchestrator session. Captures in-flight agents, scratchpads, locked decisions, open PRs, and dispatch intent so the next window starts hot.

### Methodology

- **`research-mode`** — Anti-hallucination mode: require citations, surface conflicts, refuse to present uncertain claims as fact. Toggleable; built for spec review and source-grounded analysis.
- **`skill-creator`** — Author or revise an AI-agent skill using the 5-part trigger contract, evidence-tier (E / P / H) gating, and progressive disclosure. LLM-agnostic and registry-agnostic (scribe, `.claude/skills`, `.ai/skills`, custom backends). Mandatory reviewer pass before declaring done.

## Why these skills don't misfire

Every skill in this catalog ships with two things most don't:

**A 5-part `description` contract.** Use when / Inputs / Do not use when / Produces / Escalate if. The router only sees the description on every invocation, so the contract is the trigger boundary. No "always use this" pushy phrasing. Sharp disqualifiers prevent near-miss firing.

**Routing + structural evals.** `evals/trigger.csv` replays real prompts (positives that should fire + near-misses that share keywords but shouldn't) against the router. `evals/checks.md` inherits 15 deterministic structural checks (frontmatter, body length, provenance, no pushy language, etc.). Description edits and model upgrades re-run the regression — broken triggers fail before they merge.

Read [`skill-creator/SKILL.md`](skill-creator/SKILL.md) for the full procedure and [`skill-creator/evals/checks.md`](skill-creator/evals/checks.md) for the 15-check audit.

## How progressive disclosure pays off

Larger skills are folders, not monoliths:

```text
skill-name/
  SKILL.md          # small router — trigger contract + evidence tier + entry points
  workflows/        # loaded only when a specific mode fires
  references/       # models, rubrics, principles loaded on demand
  scripts/          # deterministic helpers (no LLM needed)
  evals/            # trigger.csv + checks.md — skill tests, not runtime context
```

The router stays under ~120 lines, so the LLM sees only the contract on every invocation. Mode-specific bodies load when triggered. Evals never enter runtime context — they live on disk for regression replay.

## Install

### Via Scribe (recommended)

```bash
scribe registry connect Naoray/skills
scribe browse --registry Naoray/skills
scribe add Naoray/skills:<skill-name> --yes
```

Scribe keeps the canonical copy in `~/.scribe/skills/` and links it into Claude Code, Cursor, Codex, and Gemini.

Want all 15?

```bash
scribe registry connect Naoray/skills --install-all
```

Requires scribe v0.9.0-beta.1 or later.

### Let your AI set it up

Paste this into Claude Code, Cursor, Codex, or any agentic LLM — works whether scribe is installed or not:

```
Help me set up the Naoray/skills registry (https://github.com/Naoray/skills) for my AI coding tools.

1. Check if scribe is installed: `scribe --version`. If missing, install from
   https://github.com/Naoray/scribe and make sure `gh auth status` succeeds.

2. Connect the registry: `scribe registry connect Naoray/skills`.

3. Ask whether I want to cherry-pick skills or install the whole catalog:
   - Cherry-pick (default): `scribe browse --registry Naoray/skills`, show the list,
     install my picks with `scribe add Naoray/skills:<name> --yes`.
   - Whole catalog: `scribe registry connect Naoray/skills --install-all` (skip step 2
     if you run this; requires scribe v0.9.0-beta.1+).

4. Confirm final state with `scribe list`.

Pause before any install or connect command so I can approve.
```

### Manual (no Scribe)

Clone and symlink. Example for Claude Code:

```bash
git clone https://github.com/Naoray/skills.git ~/skills-src
ln -s ~/skills-src/plan-my-day   ~/.claude/skills/plan-my-day
ln -s ~/skills-src/skill-creator ~/.claude/skills/skill-creator
```

## Stay in sync

```bash
scribe sync
```

Updates only the skills you already installed. Never adds new ones behind your back.

## Curation policy

Every skill in `scribe.yaml` cleared the [`skill-creator`](skill-creator/SKILL.md) fit gate: repeated workflow (2+ prior real invocations), stable artifact, durable cognitive model, sharp trigger boundary, unique slot, declared evidence tier, acceptable overreach risk.

What's intentionally **not** in the catalog:

- **`recap`, `recap-report`, `scribe-agent`** — recap is being rethought; scribe ships its own agent skill.

Past consolidations:

- `code-review-artifacts` replaces `flow-review` and `xray`.
- `visual-review` covers both browser UI and CLI/TUI review.
- `changelog-pr` covers release PR bodies and `CHANGELOG.md` updates.

## Repo layout

```text
.
├── plan-my-day/           # daily workflow
├── evaluate-day/
├── session-plan/
├── record/
├── meeting/
├── apple-calendar/        # system integration
├── dev-browser/
├── cleanup/
├── changelog-pr/          # release pipeline
├── code-review-artifacts/
├── visual-review/
├── orchestrator-mode/     # multi-agent
├── orchestrator-handoff/
├── research-mode/         # methodology
├── skill-creator/
└── scribe.yaml            # registry manifest
```

Each skill is self-contained — install one without the others.

## Contributing

Issues and PRs welcome. New skill proposals must pass the [`skill-creator`](skill-creator/SKILL.md) fit gate; open an issue with the proposed 5-part trigger contract and evidence tier before writing the SKILL.md.

## New to scribe?

Start here → [Naoray/scribe](https://github.com/Naoray/scribe)

## License

See `LICENSE`.
