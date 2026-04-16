# Naoray's Skills

My personal registry of Claude Code, Cursor, and Codex skills.
Built with [Scribe](https://github.com/Naoray/scribe).

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

Prefer everything over cherry-picking? Once [scribe#104](https://github.com/Naoray/scribe/issues/104) ships:

```bash
scribe registry connect Naoray/skills --install-all
```

One command, connected and fully installed. Optional — skipping it and opting in skill by skill is the recommended path.

## New to scribe?

Start here → [Naoray/scribe](https://github.com/Naoray/scribe)
