---
name: testing-todofordopamine
description: Test the ToDoForDopamine app end-to-end. Use when verifying UI, theme, task CRUD, or progress bar changes.
---

# Testing ToDoForDopamine

## Overview
ToDoForDopamine is a vanilla HTML/CSS/JS todo app with zero dependencies. No build step, no server, no framework.

## How to Run Locally
Open `index.html` directly in Chrome via `file://` protocol:
```
file:///path/to/repo/index.html
```
No `npm install`, no dev server needed.

## App Structure
- `index.html` — single-page HTML (theme picker, task form, task list, progress bar)
- `script.js` — all JS logic (state management, DOM rendering, localStorage persistence)
- `style.css` — all styles (CSS custom properties for theming, `[data-color]` attribute selectors)

## Key Features to Test

### Theme Picker
- Click "Color" button (top-right) to open theme menu
- 8 color options: RD, RNG, YLLW, GRN, BL, PRPL, PNK, BLCK
- Theme buttons are JS-generated from `THEME_OPTIONS` array in `script.js`
- Swatch colors use CSS variable inheritance (`[data-color]` on each button inherits `--accent-start`/`--accent-end`)
- Menu closes via: clicking a theme, toggle click on "Color", pressing Escape, clicking outside
- Active theme gets `is-active` class

### Task CRUD
- Type in input field + press Enter or click "+" to add a task
- Click the circle check button to toggle complete/incomplete
- Click the trash icon to delete a task
- All task DOM elements created via `createElement(tag, props)` helper

### Progress Bar
- Counter format: `"X / Y completed"`
- Step format: `"Each task +Z%"` (or `"Add a task to start"` when empty)
- Progress bar fill width and percentage label update on every state change
- Empty state shows `"No tasks yet. Add one with +"`

### State Persistence
- State saved to `localStorage` under key `todoForDopamine`
- Tasks and color theme persist across page reloads
- Inline `<script>` in `<head>` applies saved theme before CSS loads (prevents flash)

## Testing Tips
- All features are on a single page — no navigation needed
- Test theme switching by verifying accent color changes on the "0%" label and "+" button
- To verify `createElement` helper works, add tasks and confirm check/delete buttons have correct SVG icons and aria-labels
- To verify event delegation, click theme options and confirm theme changes (event delegation on `themeMenu` container)
- After testing, reload the page (F5) to verify localStorage persistence
- The `--radius-inner` CSS variable controls border-radius for input, task items, add button, and empty state — zoom in to verify consistent rounding

## Devin Secrets Needed
None. This is a fully client-side app with no authentication or API calls.
