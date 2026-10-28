// Bundled sample documents. They used to be fetched from /samples/*.md, which fails in the
// Electron build (the app is loaded from file://, where fetch() of a sibling file is blocked)
// and cost a network round-trip on the web. Kept as plain strings so both builds load them.
export interface Sample {
  name: string;
  filename: string;
  content: string;
}

export const SAMPLES: Sample[] = [
  {
    name: "Welcome",
    filename: "welcome.md",
    content:
      "# Welcome to Markdown Viewer\n" +
      "\n" +
      "A clean, powerful markdown editor inspired by Typora and Mark Text.\n" +
      "\n" +
      "## Getting Started\n" +
      "\n" +
      "Open a file from the sidebar, drag-and-drop a `.md` file, or start typing in the editor on the left. The preview updates in real time.\n" +
      "\n" +
      "### Keyboard Shortcuts\n" +
      "\n" +
      "| Action | Shortcut |\n" +
      "|--------|----------|\n" +
      "| Bold | `Cmd+B` |\n" +
      "| Italic | `Cmd+I` |\n" +
      "| Link | `Cmd+K` |\n" +
      "| Code block | `Cmd+Shift+K` |\n" +
      "| Find in document | `Cmd+F` |\n" +
      "| Save now | `Cmd+S` |\n" +
      "| Toggle sidebar | `Cmd+\\` |\n" +
      "\n" +
      "## Features\n" +
      "\n" +
      "- Split-pane editing — editor and preview side-by-side\n" +
      "- GFM support — tables, task lists, strikethrough, footnotes\n" +
      "- Syntax highlighting — all major languages\n" +
      "- Multiple tabs — work on several files at once\n" +
      "- Export — download as HTML or PDF\n" +
      "- Auto-save — changes saved to localStorage automatically\n" +
      "- Rename — double-click a file in the sidebar\n" +
      "- Dark mode — easy on the eyes\n" +
      "\n" +
      "---\n" +
      "\n" +
      "Happy writing!\n" +
      "",
  },
  {
    name: "GFM Demo",
    filename: "sample-gfm.md",
    content:
      "# GitHub Flavored Markdown Demo\n" +
      "\n" +
      "This document demonstrates all the GFM features supported by Markdown Viewer.\n" +
      "\n" +
      "## Tables\n" +
      "\n" +
      "| Feature | Status | Priority |\n" +
      "| :------ | :----: | -------: |\n" +
      "| Tables | Done | High |\n" +
      "| Task Lists | Done | High |\n" +
      "| Strikethrough | Done | Medium |\n" +
      "| Autolinks | Done | Low |\n" +
      "| Footnotes | Done | Low |\n" +
      "\n" +
      "## Task Lists\n" +
      "\n" +
      "### Project Milestones\n" +
      "\n" +
      "- [x] Core editor functionality\n" +
      "- [x] Markdown preview with GFM\n" +
      "- [x] Syntax highlighting\n" +
      "- [x] File management\n" +
      "- [ ] Collaborative editing\n" +
      "- [ ] Cloud sync\n" +
      "- [ ] Plugin system\n" +
      "\n" +
      "### Shopping List\n" +
      "\n" +
      "- [x] Coffee beans\n" +
      "- [x] Milk\n" +
      "- [ ] Dark chocolate\n" +
      "- [ ] Sourdough bread\n" +
      "\n" +
      "## Strikethrough\n" +
      "\n" +
      "This is ~~deleted text~~ that has been removed.\n" +
      "\n" +
      "The old price was ~~$99.99~~ and the new price is **$49.99**.\n" +
      "\n" +
      "## Autolinks\n" +
      "\n" +
      "Visit https://github.com for more information.\n" +
      "\n" +
      "## Code Blocks with Syntax Highlighting\n" +
      "\n" +
      "### TypeScript\n" +
      "\n" +
      "```typescript\n" +
      "interface User {\n" +
      "  id: string;\n" +
      "  name: string;\n" +
      "  email: string;\n" +
      "  roles: Role[];\n" +
      "}\n" +
      "\n" +
      "type Role = 'admin' | 'editor' | 'viewer';\n" +
      "\n" +
      "async function fetchUser(id: string): Promise<User> {\n" +
      "  const response = await fetch(`/api/users/${id}`);\n" +
      "  if (!response.ok) {\n" +
      "    throw new Error(`Failed to fetch user: ${response.statusText}`);\n" +
      "  }\n" +
      "  return response.json();\n" +
      "}\n" +
      "```\n" +
      "\n" +
      "### CSS\n" +
      "\n" +
      "```css\n" +
      ".container {\n" +
      "  display: grid;\n" +
      "  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n" +
      "  gap: 1.5rem;\n" +
      "  padding: 2rem;\n" +
      "}\n" +
      "\n" +
      "@media (prefers-color-scheme: dark) {\n" +
      "  .container {\n" +
      "    background-color: #1a1a2e;\n" +
      "    color: #e0e0e0;\n" +
      "  }\n" +
      "}\n" +
      "```\n" +
      "\n" +
      "### JSON\n" +
      "\n" +
      "```json\n" +
      "{\n" +
      "  \"name\": \"markdown-viewer\",\n" +
      "  \"version\": \"1.0.0\",\n" +
      "  \"features\": [\n" +
      "    \"GFM support\",\n" +
      "    \"Syntax highlighting\",\n" +
      "    \"Dark mode\",\n" +
      "    \"Export to HTML/PDF\"\n" +
      "  ]\n" +
      "}\n" +
      "```\n" +
      "\n" +
      "### Bash\n" +
      "\n" +
      "```bash\n" +
      "#!/bin/bash\n" +
      "echo \"Setting up project...\"\n" +
      "npm install\n" +
      "npm run build\n" +
      "echo \"Done! Run 'npm start' to begin.\"\n" +
      "```\n" +
      "\n" +
      "## Nested Lists\n" +
      "\n" +
      "1. First item\n" +
      "   - Sub-item A\n" +
      "   - Sub-item B\n" +
      "     - Deep nested item\n" +
      "     - Another deep item\n" +
      "2. Second item\n" +
      "   1. Ordered sub-item\n" +
      "   2. Another ordered sub-item\n" +
      "3. Third item\n" +
      "\n" +
      "## Blockquotes\n" +
      "\n" +
      "> This is a simple blockquote.\n" +
      "\n" +
      "> **Nested blockquotes:**\n" +
      ">\n" +
      "> > \"Any sufficiently advanced technology is indistinguishable from magic.\"\n" +
      "> >\n" +
      "> > -- Arthur C. Clarke\n" +
      "\n" +
      "## Horizontal Rules\n" +
      "\n" +
      "Above the rule.\n" +
      "\n" +
      "---\n" +
      "\n" +
      "Below the rule.\n" +
      "\n" +
      "***\n" +
      "\n" +
      "Another section.\n" +
      "\n" +
      "## Emphasis Combinations\n" +
      "\n" +
      "This is ***bold and italic*** text.\n" +
      "\n" +
      "This is **bold with *italic* inside** text.\n" +
      "\n" +
      "## Inline Code\n" +
      "\n" +
      "Use `console.log()` for debugging. The `Array.prototype.map()` method creates a new array.\n" +
      "\n" +
      "## Links\n" +
      "\n" +
      "- [Markdown Guide](https://www.markdownguide.org)\n" +
      "- [GitHub](https://github.com)\n" +
      "\n" +
      "## Line Breaks\n" +
      "\n" +
      "This line has two spaces at the end\n" +
      "to create a line break.\n" +
      "\n" +
      "This is a new paragraph entirely.\n" +
      "",
  },
];

export function findSample(filename: string): Sample | undefined {
  return SAMPLES.find((s) => s.filename === filename);
}
