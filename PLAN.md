# Markdown Viewer — plan and pass log

Next.js static export (`out/`) deployed on Vercel from `main`, and the same export wrapped by Electron (`electron/main.js`,
`npm run electron:build` → `dist/*.dmg`). Local checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`, then a
private headless Chromium against `python3 -m http.server --directory out` and `electron <smoke script>` for the shell.

## Bug-fix + feature pass 2026-10-28
Found by reading the code and verified in the built export (headless Chromium, 1280 + 390) and in the real Electron shell:
- Autosave never cleared the blue "unsaved" dot (storage was written with `isDirty:false`, React state kept `true`) and
  switching tabs inside the 1 s debounce cancelled the previous file's pending save, so its last edits were lost on reload.
  `useAutoSave` now saves every dirty file, reports what it wrote so the marker clears only where the content is still the
  same, and flushes on `pagehide` / `visibilitychange`. Status bar shows Unsaved / Saved; `Cmd+S` saves now.
- One CodeMirror instance was shared across tabs, so `Cmd+Z` in file B could restore file A's text. The editor is keyed by
  file id (per-file undo history).
- Table of contents ids were built by hand and disagreed with rehype-slug (punctuation, repeated headings, `#` lines inside
  fenced code), so clicks often went nowhere; headings now come from `github-slugger` outside fences. The TOC works in
  editor-only view (moves the cursor to the heading's line), and has a scroll spy.
- "Export as HTML" produced an empty body in editor-only view (it read the hidden preview); it now renders the document
  off-screen. Export file name / title drop the extension; the object URL is revoked after the click.
- Samples were fetched from `/samples/*.md`, which fails under `file://` in the Electron build; they are bundled in
  `lib/samples.ts`.
- Cmd/Ctrl+F opened the browser's find bar (toolbar advertised it as the app's search); `Cmd+F` now opens the search bar,
  `Cmd+\` toggles the sidebar, `Cmd+Shift+E` cycles editor / preview / split; CodeMirror's own search panel is off.
  Search in editor-only view counts and selects matches in the source (the preview is not mounted there); the preview
  search also finds text inside bold / links / inline code / table cells, which it skipped.
- Sidebar: delete button was a `<button>` nested in a `<button>` (invalid, inaccessible); delete asks for confirmation;
  files can be renamed by double-click; the list was headed "Open Files" but lists every file.
Gates: tsc clean, lint clean, `next build` clean; web smoke (samples, TOC ids 19/19 + scroll + active heading, Cmd+F,
editor-only search 1/6, export has the document, dirty dot clears, Cmd+S, per-file undo, rename, sidebar shortcut, theme,
delete confirm, 390px no overflow, 0 console errors); Electron shell loads the export and the bundled sample.
Left: Electron has no app menu of its own (default menu), no "Open with" from Finder, and logs the usual dev CSP warning;
the dmg in `dist/` needs a rebuild + reinstall to pick this up (owner).
