---
name: dev-browser
description: Use when the user asks to navigate a website, click UI, fill forms, take screenshots, scrape visible page data, test a web app, log into a browser session, or automate browser workflows with persistent page state. Inputs - target URL or existing page context, desired browser action, selectors or visible labels when known, credentials only when user explicitly provides them. Do not use when a plain HTTP request, local file edit, or Playwright test suite is the better artifact; use those tools instead. Produces dev-browser CLI commands or sandboxed JavaScript automation steps plus captured results. Escalate if login, payment, destructive actions, CAPTCHA, or sensitive personal data is involved.
source:
  url: https://github.com/SawyerHood/dev-browser
  author: SawyerHood
  note: Adapted with attribution
---

# Dev Browser

**Evidence tier**: P
**Basis**: Practitioner workflow for browser automation using persistent page state and sandboxed JavaScript execution.
**Source IDs**: SawyerHood/dev-browser
**Reviewed**: 2026-05-12

A CLI for controlling browsers with sandboxed JavaScript scripts.

## Installation

```bash
npm install -g dev-browser
dev-browser install
```

## Usage

Run `dev-browser --help` to learn more.
