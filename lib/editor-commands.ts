import { EditorView } from "@codemirror/view";

function wrapSelection(
  view: EditorView,
  before: string,
  after: string
): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = `${before}${selected || "text"}${after}`;
  view.dispatch({
    changes: { from, to, insert: replacement },
    selection: {
      anchor: from + before.length,
      head: from + before.length + (selected ? selected.length : 4),
    },
  });
  view.focus();
}

function insertAtLineStart(view: EditorView, prefix: string): void {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  view.dispatch({
    changes: { from: line.from, to: line.from, insert: prefix },
  });
  view.focus();
}

function insertText(view: EditorView, text: string): void {
  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  });
  view.focus();
}

export function toggleBold(view: EditorView): void {
  wrapSelection(view, "**", "**");
}

export function toggleItalic(view: EditorView): void {
  wrapSelection(view, "*", "*");
}

export function toggleStrikethrough(view: EditorView): void {
  wrapSelection(view, "~~", "~~");
}

export function toggleInlineCode(view: EditorView): void {
  wrapSelection(view, "`", "`");
}

export function insertLink(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = `[${selected || "link text"}](url)`;
  view.dispatch({
    changes: { from, to, insert: replacement },
  });
  view.focus();
}

export function insertImage(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = `![${selected || "alt text"}](url)`;
  view.dispatch({
    changes: { from, to, insert: replacement },
  });
  view.focus();
}

export function insertHeading(view: EditorView, level: number): void {
  const prefix = "#".repeat(level) + " ";
  insertAtLineStart(view, prefix);
}

export function insertUnorderedList(view: EditorView): void {
  insertAtLineStart(view, "- ");
}

export function insertOrderedList(view: EditorView): void {
  insertAtLineStart(view, "1. ");
}

export function insertTaskList(view: EditorView): void {
  insertAtLineStart(view, "- [ ] ");
}

export function insertCodeBlock(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = `\n\`\`\`\n${selected || "code"}\n\`\`\`\n`;
  view.dispatch({
    changes: { from, to, insert: replacement },
  });
  view.focus();
}

export function insertTable(view: EditorView): void {
  const table = `\n| Header 1 | Header 2 | Header 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
  insertText(view, table);
}

export function insertHorizontalRule(view: EditorView): void {
  insertText(view, "\n---\n");
}
