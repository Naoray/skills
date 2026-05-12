# Portability — multi-tool sidecar adapter pattern

Skills in this registry are designed to work across Claude Code, Cursor, Codex, and Gemini without per-tool branching inside `SKILL.md`. The pattern: keep the contract portable, put tool-specific UI / dependencies / invocation wiring in **adjacent sidecars**.

## Core rule

`SKILL.md` is tool-agnostic. It describes:

- The 5-part trigger contract (`description` in frontmatter)
- The fit gate
- The evidence tier + provenance
- The procedure (in the body or in `workflows/`)
- The eval contract

It does NOT contain:

- Host-specific paths (`~/.claude/skills/...`, `.cursor/rules/...`)
- Slash-command syntax that differs across tools
- Approval-mechanism wording (Claude's permission prompts vs Codex YOLO vs Gemini policy)
- MCP setup details

Tool-specific wiring goes in sidecar files.

## Sidecars per tool

### Codex (OpenAI)

```
<skill-name>/
└── agents/
    └── openai.yaml
```

`openai.yaml` carries machine-facing UI metadata: `display_name`, `short_description`, `default_prompt`, optional icon/color. **Generate this from `SKILL.md` content — do not hand-maintain.** If the host harness consumes it, regenerate when `SKILL.md` changes. If it doesn't, omit the file entirely.

### Cursor

```
.cursor/
└── rules/
    └── <skill-name>.mdc
```

Cursor rules live at the project root (or user root), not inside the skill folder. They are NOT the skill — they are an adapter that surfaces the skill in Cursor's UI.

### Gemini CLI

```
.gemini/
├── commands/
│   └── <skill-name>.toml    # if the skill should be a slash command
└── GEMINI.md                # persistent context, optional
```

Gemini handles skills primarily through slash-command TOML adapters and `GEMINI.md` context. Native skill support is evolving; until it stabilizes, the adapter approach is most reliable.

### Claude Code

No sidecar required. Claude Code reads `SKILL.md` directly from `~/.claude/skills/` or `<project>/.claude/skills/`. If a project has `.ai/skills/`, honor that path (Laravel Boost convention; some setups enforce it via PreToolUse hook).

### Project-local Claude (single project)

```
<project>/.claude/skills/<skill-name>/
```

No sidecars. Skill is auto-discovered when working in that project.

## Generating sidecars

Sidecars should be generated, not hand-maintained:

- The host registry manager (e.g., scribe) generates them at install/sync time.
- Or `workflows/package.md` step 1 generates them as part of release.

Hand-edited sidecars drift the moment `SKILL.md` changes. Treat them as derived artifacts.

## When NOT to use sidecars

- If you have a single host environment and no plans to portable. The sidecar overhead doesn't pay rent for a one-host skill.
- If the sidecar would duplicate `SKILL.md` content verbatim. Sidecars carry host-specific UI, not the skill itself.
- If the skill is project-local and only used by Claude Code. Just drop it under `.claude/skills/`.

## Anti-patterns

- **Branching on host inside `SKILL.md`** (`if Claude Code: ...; else if Codex: ...`). The host should not be visible to the agent reading the skill. If the procedure genuinely depends on the host, that's a portability gap — either fix the procedure or make this skill manual-only on the unsupported host.
- **Maintaining sidecars by hand.** They drift. Generate them.
- **Embedding host-specific paths in the body.** Use `references/registry-integration.md` for those, never the body.

## Evidence tier of this pattern

**P** (practitioner-backed). This is the clearest cross-vendor pattern in the current ecosystem. Both OpenAI and Anthropic frame skills as "portable across tools and platforms"; both ship sidecar conventions (`agents/openai.yaml` for Codex; Cursor and Gemini have their own equivalents).

## Sources

- OpenAI Codex `agents/openai.yaml` reference — "intended for the machine/harness, not the agent."
- Anthropic Agent Skills engineering post — "portable across tools and platforms."
- Cursor skills documentation — "open standard for packaging reusable knowledge and scripts."
- Gemini CLI custom commands documentation.
- ChatGPT Deep Research synthesis on cross-tool portability patterns.
