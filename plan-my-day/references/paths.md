# plan-my-day — host paths

The skill body uses `<context-root>` as a backend variable. The default backend assumed by the catalog maintainer is Hilary Gridley's "context directory" layout (see [How I AI — Context Directory and Daily Notes](https://www.writerbuilder.com/howiai#context-directory)).

## Default layout

| Variable | Default path |
|---|---|
| `<context-root>` | `~/context/` |
| `<context-root>/admin/scripts/sync-reminders.sh` | Apple Reminders sync script (user-supplied `osascript` wrapper) |
| `<context-root>/admin/reminders-inbox.md` | Raw dump from the sync script |
| `<context-root>/admin/reminders-organized.md` | Categorized version (preserve existing categories) |
| `<context-root>/admin/daily-notes/YYYY/MM-Month/YYYY-MM-DD.md` | Daily note path. Use zero-padded month with name (e.g., `04-April`). |

## Overriding the backend

If your context directory lives elsewhere (e.g., `~/Documents/notes/`, an Obsidian vault, an org-mode repo), substitute `<context-root>` accordingly throughout the workflow. The skill does not enforce a specific filesystem location — it only assumes that the four files above exist (or get bootstrapped) somewhere consistent.

## Bootstrapping

If the layout does not exist on first run, the skill walks the user through creating the four files and the daily-notes folder structure. The reminders sync script is user-supplied — example shell at <https://www.writerbuilder.com/howiai#reminders>.
