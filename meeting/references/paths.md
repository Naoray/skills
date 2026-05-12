# meeting — host paths

The skill body uses `<meetings-root>` as a backend variable for where meeting files are stored.

## Default layout

| Variable | Default path |
|---|---|
| `<meetings-root>` | `~/context/meetings/` |
| `<meetings-root>/YYYY-MM-DD-<slug>.md` | Raw notes file (created on `/meeting <title>`, status `In Progress`) |
| `<meetings-root>/YYYY-MM-DD-<slug>-share.md` | Shareable version (created on `/meeting end`) |

`<slug>` is a lowercase, hyphenated form of the meeting title (e.g. `team-standup`).

## Overriding the backend

Point `<meetings-root>` at any directory you keep meeting notes in — an Obsidian vault, a `notes/` repo, a Logseq graph, etc. The skill only assumes:

1. The directory exists or can be created on first use.
2. Two files per meeting are acceptable (raw + share). If you prefer a single file, override the skill or run it in dry-run mode that prints the share version without writing.

## Bootstrapping

If `<meetings-root>` does not exist on `/meeting <title>`, create the directory. No other setup is required.
