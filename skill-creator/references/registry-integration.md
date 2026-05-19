# Registry Integration — Where the Skill Lives

A skill is a directory containing `SKILL.md` (+ optional bundled resources). Where that directory lives, and how to make it discoverable, depends on the host environment and the registry manager.

## Table of contents

- [No registry — project-local](#no-registry--project-local)
- [User-global Claude Code](#user-global-claude-code)
- [Laravel Boost](#laravel-boost)
- [Scribe (multi-tool, multi-machine)](#scribe-multi-tool-multi-machine)
- [Codex (OpenAI)](#codex-openai)
- [Gemini (Google)](#gemini-google)
- [Pick-your-backend checklist](#pick-your-backend-checklist)
- [Collision check before creating](#collision-check-before-creating)
- [Validation after edits](#validation-after-edits)

## No registry — project-local

Path: `<project>/.claude/skills/<skill-name>/`

Used by: Claude Code in single-project mode.

After creating: nothing to sync. The skill is auto-discovered by Claude Code when launched from this project root.

Limitation: not shared across projects. Use for project-scoped workflows (e.g., a custom deployment script for one app).

## User-global Claude Code

Path: `~/.claude/skills/<skill-name>/`

Used by: Claude Code, anywhere.

After creating: nothing to sync. Auto-discovered.

Limitation: only Claude Code; not propagated to Codex or Gemini unless you also place the same folder in their respective skill directories.

## Laravel Boost

Path: `<project>/.ai/skills/<skill-name>/`

Used by: Laravel projects with Boost installed.

After creating: run `php artisan boost:update`.

**Important convention**: when a project has `.ai/skills/` directory, skills MUST go there, not in `.claude/skills/`. Some setups enforce this with a PreToolUse hook that will block writes to `.claude/skills/`. Honor the convention to avoid blocked writes.

## Scribe (multi-tool, multi-machine)

Path: `<scribe-root>/<skill-name>/`

Catalog file: `<scribe-root>/scribe.yaml`

Catalog entry shape:

```yaml
apiVersion: scribe/v1
kind: Registry
team:
    name: <team-name>
    description: <team-description>
catalog:
    - name: <skill-name>
      source: github:<owner>/<repo>@<branch>
    - name: <other-skill>
      source: github:<owner>/<repo>@<branch>
      description: |
        Optional discovery-surface description. Use ONLY when the frontmatter
        description is long and a terser browse-blurb helps. Otherwise omit.
```

Minimum catalog entry:

```yaml
- name: <skill-name>
  source: github:<owner>/<repo>@<branch>
```

After editing `scribe.yaml`, run:

```bash
scribe sync
```

This links the canonical skill into every tool registered with scribe (Claude Code, Codex, Gemini). Without sync, the skill exists locally but is invisible to those agents.

Skip `scribe sync` only when iterating drafts you don't yet want shipped. Note the skip explicitly in the commit message.

When to add a catalog-level `description:`:
- The frontmatter description is long and the catalog needs a one-sentence summary for browsing.
- The skill is referenced by another skill or doc that needs a stable terse blurb.
- Otherwise omit — the frontmatter description is the source of truth and duplicating it invites drift.

## Codex (OpenAI)

Default skill paths vary by Codex configuration. Common locations:
- `~/.codex/skills/<skill-name>/`
- `<repo>/skills/.system/<skill-name>/` (for project-scoped Codex skills)

Codex skills may include an `agents/openai.yaml` file with UI-facing metadata (`display_name`, `short_description`, `default_prompt`). Generate this **only** when the host actually requires it — most personal registries don't.

After creating: Codex auto-discovers from its skills directory. Restart the Codex session if changes don't appear.

## Gemini (Google)

Path: `~/.gemini/skills/<skill-name>/` (or `<project>/.gemini/skills/<skill-name>/`)

If the same skill name exists in multiple locations, Gemini emits a "Skill conflict detected" warning at startup and uses one as the override. Avoid duplicating skill names across `~/.agents/skills/`, `~/.gemini/skills/`, and project-local copies.

After creating: relaunch Gemini for the skill to register.

## Pick-your-backend checklist

Before writing the skill, decide:

1. **Is this skill personal or team-shared?** Personal → user-global or scribe. Team → scribe or project-local-committed.
2. **Single tool or multi-tool?** Single → that tool's local directory. Multi → scribe.
3. **Stable or experimental?** Stable → committed registry. Experimental → project-local drafts; promote to registry once proven.
4. **Cross-machine sync needed?** Yes → scribe. No → user-global or project-local.

The backend determines step 7 of the authoring loop ("integrate with the registry manager"). Pick early; switching mid-authoring wastes work.

## Collision check before creating

Before naming a new skill, both of these must return empty:

```bash
# 1. Folder collision in your registry root:
ls -d <registry-root>/<proposed-name> 2>/dev/null

# 2. Catalog collision (if you use a catalog file like scribe.yaml):
grep -E "^- name: <proposed-name>$" <registry-root>/scribe.yaml 2>/dev/null
```

If either hits: rename, or merge into the existing skill (if the proposed skill duplicates an existing cognitive slot).

## Validation after edits

Universal checks (run for any backend):

- Folder name === frontmatter `name`
- Frontmatter has both `name` and `description`
- The skill triggers correctly on 2 should-trigger prompts and stays silent on 1 near-miss prompt

Catalog-aware backend checks (scribe, custom YAML catalogs):

```bash
# Folder count should match catalog entry count:
ls -d <registry-root>/*/ | wc -l
grep -cE "^    - name:" <registry-root>/scribe.yaml
```

If the numbers don't match: a folder is missing from the catalog (sync failure waiting to happen) or a catalog entry is missing its folder (broken reference). Fix the divergence before declaring the skill done.
