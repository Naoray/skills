---
name: scribe-agent
description: Use when the user asks to install, list, sync, remove, adopt, explain, or manage local AI coding-agent skills with the scribe CLI. Inputs - target skill name or owner/repo:skill reference, desired operation, registry information if connecting one, and confirmation for removals or adoption. Do not use when the user wants to author a new skill, edit skill contents manually, or browse general agent capabilities; use skill-creator, direct repo edits, or discovery workflows instead. Produces deterministic scribe commands with JSON output handling and a concise result summary. Escalate if scribe is unavailable, registry state conflicts, adoption has collisions, output is non-JSON despite --json, or PR/catalog status makes installation inappropriate.
---

# Scribe Agent

**Evidence tier**: P
**Basis**: Practitioner workflow for Scribe CLI management of local coding-agent skills and registry-backed installs.
**Source IDs**: Naoray/scribe CLI; scribe-agent/SKILL.md command reference; PR #7 catalog removal plan
**Reviewed**: 2026-05-12
**Status**: removed-from-catalog

Scribe manages local coding-agent skills.
It stores canonical copies in `~/.scribe/skills/` and links them into supported tool directories.
Use it for installs, updates, removal, adoption of unmanaged local skills, and structured inspection.
If `scribe` is missing, stop and tell the user to install or provide the project-approved install path before continuing.

## Trigger phrases to commands

| Trigger | Command |
|---------|---------|
| search available skills | `scribe browse --json` |
| search available skills matching X | `scribe browse --query X --json` |
| install the X skill | `scribe browse --install X --yes --json` |
| install X from owner/repo | `scribe add owner/repo:X --yes --json` |
| what skills are installed | `scribe list --json` |
| what skills are available remotely | `scribe browse --json` |
| sync my skills | `scribe sync --json` |
| remove X | `scribe remove X --yes --json` |
| import existing local skills | `scribe adopt --dry-run --json` |
| actually adopt them | `scribe adopt --yes --json` |
| explain what X does | `scribe explain X --json` |
| show scribe status | `scribe status --json` |
| connect a registry | `scribe registry connect owner/repo` |
| refresh bootstrap skill | `scribe upgrade-agent --json` |

## Non-negotiable rules

1. Use `--json` for anything you plan to parse, because styled output is not stable.
2. Prefer `scribe browse --query ... --json` for discovery and `scribe browse --install ... --yes --json` for exact-name installs.
3. Prefer `owner/repo:skill` for deterministic installs.
4. Use `--yes` for direct installs and removals after the user has confirmed the action.
5. Use `scribe adopt --dry-run --json` before `scribe adopt --yes --json` so conflicts are visible first.
6. Do not hand-edit `~/.scribe/state.json`; Scribe owns that state file.
7. Do not copy skill files directly into tool directories; use `scribe adopt` so links and state stay consistent.
8. `scribe sync` reconciles registries; it does not install an arbitrary new skill by query.
9. `scribe list` is local-first. Use `scribe browse` for registry discovery.
10. Some failures still return plain stderr plus non-zero exit, not a JSON error envelope.

### `scribe list --json`

Each item may include `name`, `desc`, `pkg`, `revision`, `content_hash`, `targets`, `managed`, `o/`, and `path`.
Fresh-home output is `[]`.

### `scribe browse --json`

Top level: object with `registries`.
Each registry has `registry` and `skills`.
Each remote skill may include `name`, `status`, `version`, `loadout_ref`, `maintainer`, and `agents`.

### `scribe browse --query query --json`

Same envelope as `scribe browse --json`, but filtered to matching remote skills.

### `scribe browse --install skill --yes --json`

Top level: object with `installed`.
Each installed item may include `name`, `registry`, `status`, and `err`.
Observed statuses: `installed`, `updated`, `already-installed`, `err`.

### `scribe add query --json`

Top level: object with `results`.
Each result may include `name`, `registry`, `status`, `version`, `desc`, and `author`.
This is a legacy search/install-discovery path. Prefer `scribe browse`.

### `scribe add owner/repo:skill --yes --json`

Top level: object with `installed`.
Each installed item may include `name`, `registry`, `status`, and `err`.
Observed statuses: `installed`, `updated`, `already-installed`, `err`.

### `scribe sync --json`

Top level: object with `registries` and `summary`.
Each registry has `registry` and `skills`.
Each skill result may include `name`, `action`, `status`, `version`, and `err`.
`summary` has `installed`, `updated`, `skipped`, and `failed`.
Observed actions: `installed`, `updated`, `skipped`, `err`, `pkg_installed`, `pkg_updated`, `denied`.
An optional top-level `adoption` object may appear.

### `scribe adopt --dry-run --json`

Top level: object with `dry_run`, `adopt`, and `conflicts`.
`adopt` entries may include `name`, `local_path`, `targets`, and `hash`.
`conflicts` entries may include `name`, `managed_hash`, `unmanaged_path`, and `unmanaged_hash`.

### `scribe adopt --yes --json`

Top level: formatter envelope with `registries`, `summary`, and `adoption`.
`adoption` may include `skills`, `conflicts_deferred`, `adopted`, `failed`, and `skipped`.

### `scribe remove skill --yes --json`

Top level: object with `-`.
Optional fields: `managed_by`, `errors`.

### `scribe explain skill --json`

Top level: object with `name` and `content`.
Optional fields: `desc`, `revision`, `targets`, and `path`.
This command only works for installed skills on disk.

### `scribe status --json`

Top level: object with `version`, `registries`, and `installed_count`.
Optional field: `last_sync`.

## Recipes

Install deterministically:

```sh
scribe add owner/repo:skill --yes --json
```

Search, then install:

```sh
scribe browse --query query --json
scribe browse --install owner/repo:skill --yes --json
```

Check status:

```sh
scribe status --json
```

Adopt unmanaged local skills:

```sh
scribe adopt --dry-run --json
scribe adopt --yes --json
```

## Avoid

- Bare `scribe add` in automation.
- Using `scribe list` when you mean "show installable remote skills".
- Parsing styled terminal output instead of `--json`.
- Using `scribe sync` when you mean "install one skill".
- Removing files by hand from tool directories.
- Editing `~/.scribe/state.json` directly.
- Assuming every failure returns JSON.

If you need a command not listed here, run:

```sh
scribe <subcommand> --help
```

Do not guess flags or JSON fields.
