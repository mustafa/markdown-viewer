# Welcome to Markdown Viewer

A beautiful, minimal markdown editor and previewer built with Next.js.

## Getting Started

Start typing in the **editor pane** on the left and see the rendered preview on the right. The editor supports full **GitHub Flavored Markdown** (GFM).

### Features

- **Split-pane editing** with real-time preview
- **Syntax highlighting** for code blocks
- **Dark mode** and light mode support
- **Multiple file tabs** for working on several documents
- **Auto-save** to localStorage so you never lose your work
- **Export** to HTML or PDF
- **Table of contents** auto-generated from headings
- **Keyboard shortcuts** for fast formatting

## Keyboard Shortcuts

| Shortcut | Action |
| -------- | ------ |
| `Cmd+B` | **Bold** |
| `Cmd+I` | *Italic* |
| `Cmd+K` | Insert link |
| `Cmd+Shift+K` | Insert code block |

## Code Blocks

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to Markdown Viewer`;
}

greet('World');
```

```python
def fibonacci(n):
    """Generate fibonacci sequence up to n terms."""
    a, b = 0, 1
    sequence = []
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

print(fibonacci(10))
```

## Task Lists

- [x] Set up the project
- [x] Build the editor
- [x] Add markdown preview
- [ ] Add more features
- [ ] Ship it!

## Blockquotes

> "The best way to predict the future is to invent it."
>
> -- Alan Kay

## Images

You can drag and drop images into the editor, and they will be converted to base64 inline images.

---

Enjoy writing in Markdown!
