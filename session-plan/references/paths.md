# session-plan — host paths

The skill body uses `<context-root>` as a backend variable. The default backend assumed by the catalog maintainer is a per-domain context directory.

## Default layout

| Variable | Default path |
|---|---|
| `<context-root>` | `~/Context/` |
| `<context-root>/<domain>/profile.md` | Player / writer / learner profile |
| `<context-root>/<domain>/learning-path.md` | Current phase + strategy |
| `<context-root>/<domain>/progress.md` | Most recent entries (top ~60 lines are enough) |
| `<context-root>/<domain>/<subjects>/` | Per-subject notes (e.g. `songs/`, `chapters/`, `lessons/`) |
| `<context-root>/<domain>/logs/takes.csv` | Most recent 3–5 rows for the latest measurements (only present for measured domains) |

`<domain>` is the `$1` argument to the skill — default `bass`. Other valid examples: `writing`, `study`, `language`.

## Overriding the backend

Substitute `<context-root>` if your domain directories live elsewhere. The skill only assumes:

1. A consistent directory per domain.
2. The five files above (or as many as the domain needs — `logs/takes.csv` is optional).

Missing files are skipped gracefully. The skill will not invent measurements when no log exists.

## Adding a new domain

Create `<context-root>/<new-domain>/` with at minimum `profile.md`, `learning-path.md`, and `progress.md`. Subject directory and logs are domain-specific.
