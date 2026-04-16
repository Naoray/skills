# Naoray's Skills

My personal registry of Claude Code, Cursor, and Codex skills.
Built with [Scribe](https://github.com/Naoray/scribe).

## Let your AI set it up

Paste this into Claude Code, Cursor, Codex, or any agentic LLM. Works whether scribe is installed or not:

```
Help me set up the Naoray/skills registry (https://github.com/Naoray/skills) for my AI coding tools.

1. Check if scribe is installed: run `scribe --version`. If it's missing, follow the install instructions at https://github.com/Naoray/scribe and make sure `gh auth status` succeeds — scribe uses the GitHub CLI for auth.

2. Connect the registry: `scribe registry connect Naoray/skills`.

3. Ask me whether I want to cherry-pick skills or install the whole catalog:
   - Cherry-pick (default): run `scribe browse --registry Naoray/skills`, show me the list, and install my picks with `scribe add Naoray/skills:<name> --yes`.
   - Whole catalog: `scribe registry connect Naoray/skills --install-all` (skip step 2 if you run this; requires scribe v0.9.0-beta.1+).

4. Confirm the final state with `scribe list`.

Pause before any install or connect command so I can approve.
```

Prefer the manual path? Keep reading.

## Connect

```bash
scribe registry connect Naoray/skills
```

Tells scribe the registry exists. Nothing gets installed — you choose what you want.

## Browse the catalog

```bash
scribe browse --registry Naoray/skills
```

Each skill listed here has earned its place in my daily workflow.

## Install what you want

Pick one:

```bash
scribe browse --install <skill-name> --yes
```

Or install directly without browsing:

```bash
scribe add Naoray/skills:<skill-name> --yes
```

Scribe stores the canonical copy in `~/.scribe/skills/` and links it into every AI tool you already use — Claude Code, Cursor, Codex, Gemini.

## Stay in sync

Once a skill is installed, pull my updates with:

```bash
scribe sync
```

Sync only updates what you've already installed. It never adds new skills behind your back.

## Shortcut: install the whole catalog

Prefer everything over cherry-picking?

```bash
scribe registry connect Naoray/skills --install-all
```

One command, connected and fully installed. Optional — skipping it and opting in skill by skill is the recommended path. Requires scribe v0.9.0-beta.1 or later.

## New to scribe?

Start here → [Naoray/scribe](https://github.com/Naoray/scribe)
