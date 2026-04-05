# GitHub Flavored Markdown Demo

This document demonstrates all the GFM features supported by Markdown Viewer.

## Tables

| Feature | Status | Priority |
| :------ | :----: | -------: |
| Tables | Done | High |
| Task Lists | Done | High |
| Strikethrough | Done | Medium |
| Autolinks | Done | Low |
| Footnotes | Done | Low |

## Task Lists

### Project Milestones

- [x] Core editor functionality
- [x] Markdown preview with GFM
- [x] Syntax highlighting
- [x] File management
- [ ] Collaborative editing
- [ ] Cloud sync
- [ ] Plugin system

### Shopping List

- [x] Coffee beans
- [x] Milk
- [ ] Dark chocolate
- [ ] Sourdough bread

## Strikethrough

This is ~~deleted text~~ that has been removed.

The old price was ~~$99.99~~ and the new price is **$49.99**.

## Autolinks

Visit https://github.com for more information.

## Code Blocks with Syntax Highlighting

### TypeScript

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

type Role = 'admin' | 'editor' | 'viewer';

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}
```

### CSS

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

@media (prefers-color-scheme: dark) {
  .container {
    background-color: #1a1a2e;
    color: #e0e0e0;
  }
}
```

### JSON

```json
{
  "name": "markdown-viewer",
  "version": "1.0.0",
  "features": [
    "GFM support",
    "Syntax highlighting",
    "Dark mode",
    "Export to HTML/PDF"
  ]
}
```

### Bash

```bash
#!/bin/bash
echo "Setting up project..."
npm install
npm run build
echo "Done! Run 'npm start' to begin."
```

## Nested Lists

1. First item
   - Sub-item A
   - Sub-item B
     - Deep nested item
     - Another deep item
2. Second item
   1. Ordered sub-item
   2. Another ordered sub-item
3. Third item

## Blockquotes

> This is a simple blockquote.

> **Nested blockquotes:**
>
> > "Any sufficiently advanced technology is indistinguishable from magic."
> >
> > -- Arthur C. Clarke

## Horizontal Rules

Above the rule.

---

Below the rule.

***

Another section.

## Emphasis Combinations

This is ***bold and italic*** text.

This is **bold with *italic* inside** text.

## Inline Code

Use `console.log()` for debugging. The `Array.prototype.map()` method creates a new array.

## Links

- [Markdown Guide](https://www.markdownguide.org)
- [GitHub](https://github.com)

## Line Breaks

This line has two spaces at the end
to create a line break.

This is a new paragraph entirely.
