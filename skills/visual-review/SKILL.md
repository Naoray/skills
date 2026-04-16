---
name: visual-review
description: Use when asked to "visually review a PR", "screenshot a PR", "visual QA", "check how a PR looks", or "visual review". Web/browser-based visual QA of pull requests in isolated anvil worktrees using dev-browser.
---

# Visual Review

Visually QA a pull request in an isolated anvil worktree. Takes screenshots of affected
pages as proof for manual approval. Uses `dev-browser` for browser automation.

## When to use

- User asks to visually review, screenshot, or QA a PR
- User wants proof of how a PR looks before approving
- User asks to "check the visuals" on a PR

## Workflow

### Phase 1: Setup

1. **Get PR details:**
   ```bash
   gh pr view <number> --json title,headRefName,baseRefName,body,url
   ```

2. **Create anvil worktree** using the anvil agent:
   - `anvil work <branch-name>` from the project directory
   - Run `composer install && npm install && npm run build` in the worktree
   - Note the worktree path

3. **Set up Herd link + SSL:**
   ```bash
   cd <worktree-path>
   herd link
   herd secure <site-name>
   ```
   Update `.env` APP_URL to use `https://`.

4. **Run migrations:**
   ```bash
   cd <worktree-path>
   php artisan migrate --force
   ```

### Phase 2: Analyze Diff

1. **Identify changed files:**
   ```bash
   git diff <base-branch>...HEAD --name-only
   ```

2. **Map files to routes/pages:**
   - Controller/Livewire files -> which URL paths they serve
   - View/blade files -> which pages render them
   - CSS/JS files -> which pages include them
   - Check `php artisan route:list` to find URLs for affected routes

3. **Determine authentication needs:**
   - Check if affected routes require auth middleware
   - If so, create a test user via tinker and generate a magic link or login session

### Phase 3: Browser QA with dev-browser

Use `dev-browser` for all browser automation. Key patterns:

**Navigate to a page:**
```bash
dev-browser <<'EOF'
const page = await browser.getPage("qa");
await page.goto("https://<site>.test/path");
await page.waitForSelector("body");
const path = await saveScreenshot(await page.screenshot(), "page-name.png");
console.log(path);
EOF
# Immediately open in Preview — do this after EVERY screenshot
open -a Preview ~/.dev-browser/tmp/page-name.png
```

**Get AI snapshot for element discovery:**
```bash
dev-browser <<'EOF'
const page = await browser.getPage("qa");
const snap = await page.snapshotForAI();
console.log(snap.full);
EOF
```

**Click/interact and screenshot:**
```bash
dev-browser <<'EOF'
const page = await browser.getPage("qa");
await page.getByRole("button", { name: "Log out" }).click();
await page.waitForURL("**/magic-link");
const path = await saveScreenshot(await page.screenshot(), "after-action.png");
console.log(path);
EOF
# Immediately open in Preview — do this after EVERY screenshot
open -a Preview ~/.dev-browser/tmp/after-action.png
```

**Check for console errors:**
```bash
dev-browser <<'EOF'
const page = await browser.getPage("qa");
const errors = [];
page.on("pageerror", (err) => errors.push(err.message));
await page.goto("https://<site>.test/path");
await new Promise(r => setTimeout(r, 3000));
console.log(JSON.stringify(errors));
EOF
```

### Phase 4: Screenshot Collection

For each affected page/route:
1. Navigate to the page
2. Take a full-page screenshot
3. If the change is interactive, take before/after screenshots
4. **Immediately after each screenshot:** open it in Preview and show it inline with Read

```bash
# After every saveScreenshot call, run this immediately:
open -a Preview ~/.dev-browser/tmp/<screenshot-name>.png
```

Then use the **Read tool** on the same path so the user sees it inline in the conversation too.

### Phase 5: Present for Approval

Show the user:
- Summary of what the PR changes
- Screenshots of each affected page (inline via Read tool)
- Any console errors found
- Any visual issues noticed

Open **all** screenshots at once for side-by-side review in Preview:
```bash
open -a Preview ~/.dev-browser/tmp/<screenshot1>.png ~/.dev-browser/tmp/<screenshot2>.png
```

### Phase 6: Cleanup

Use the anvil agent to destroy the worktree:
- `herd unsecure <site-name>`
- `herd unlink <site-name>`
- `anvil remove <branch-name>`

## Important Rules

1. **NEVER change the user's local checkout branch.** All work happens in the anvil worktree.
2. **Always use `dev-browser`** for browser automation, not playwright MCP or gstack browse.
3. **Always show screenshots inline** using the Read tool so the user sees them in the conversation.
4. **Open every screenshot immediately** with `open -a Preview <path>` right after saving it — do not wait until the end. Also open all screenshots together at the end of Phase 5 for side-by-side review.
5. **Always clean up** the anvil worktree when done, unless the user wants to keep it.
6. **Authenticate when needed** — use tinker to create test users and generate signed URLs.
7. **Check both locales** if the app supports i18n (EN and DE for this project).
8. **Report console errors** that are caused by the PR changes (ignore pre-existing ones).

## Output

Screenshots saved to: `/tmp/visual-review/<pr-number>/`

Present a summary table:

| Page | Locale | Status | Screenshot |
|------|--------|--------|------------|
| /orders | EN | OK | orders-en.png |
| /orders | DE | OK | orders-de.png |

Then ask: **"Approve, request changes, or need more screenshots?"**

### Review Nudge

After presenting screenshots, remind the user that visual QA only covers appearance:

> Visual QA covers how it looks, not how it works. If you haven't already, consider running a code review (`/review`, `/code-review`, or manual diff review) before approving this PR.
