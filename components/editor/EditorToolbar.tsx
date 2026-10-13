"use client";

import { EditorView } from "@codemirror/view";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Link,
  Image as ImageIcon,
  Code,
  CodeSquare,
  Table,
  Minus,
  Search,
} from "lucide-react";
import {
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  insertHeading,
  insertUnorderedList,
  insertOrderedList,
  insertTaskList,
  insertLink,
  insertImage,
  toggleInlineCode,
  insertCodeBlock,
  insertTable,
  insertHorizontalRule,
} from "@/lib/editor-commands";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editorView: EditorView | null;
  onToggleSearch: () => void;
  searchActive: boolean;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: (view: EditorView) => void;
  shortcut?: string;
}

export default function EditorToolbar({
  editorView,
  onToggleSearch,
  searchActive,
}: EditorToolbarProps) {
  const buttons: (ToolbarButton | "separator")[] = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: "Bold",
      action: toggleBold,
      shortcut: "Cmd+B",
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: "Italic",
      action: toggleItalic,
      shortcut: "Cmd+I",
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      label: "Strikethrough",
      action: toggleStrikethrough,
    },
    "separator",
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: "Heading 1",
      action: (v) => insertHeading(v, 1),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: "Heading 2",
      action: (v) => insertHeading(v, 2),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: "Heading 3",
      action: (v) => insertHeading(v, 3),
    },
    "separator",
    {
      icon: <List className="h-4 w-4" />,
      label: "Bullet List",
      action: insertUnorderedList,
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: "Numbered List",
      action: insertOrderedList,
    },
    {
      icon: <ListChecks className="h-4 w-4" />,
      label: "Task List",
      action: insertTaskList,
    },
    "separator",
    {
      icon: <Link className="h-4 w-4" />,
      label: "Link",
      action: insertLink,
      shortcut: "Cmd+K",
    },
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: "Image",
      action: insertImage,
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: "Inline Code",
      action: toggleInlineCode,
    },
    {
      icon: <CodeSquare className="h-4 w-4" />,
      label: "Code Block",
      action: insertCodeBlock,
      shortcut: "Cmd+Shift+K",
    },
    "separator",
    {
      icon: <Table className="h-4 w-4" />,
      label: "Table",
      action: insertTable,
    },
    {
      icon: <Minus className="h-4 w-4" />,
      label: "Horizontal Rule",
      action: insertHorizontalRule,
    },
  ];

  const handleClick = (action: (view: EditorView) => void) => {
    if (editorView) {
      action(editorView);
    }
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-x-auto shrink-0">
      {buttons.map((item, i) => {
        if (item === "separator") {
          return (
            <div
              key={`sep-${i}`}
              className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1"
            />
          );
        }
        return (
          <button
            key={item.label}
            onClick={() => handleClick(item.action)}
            title={
              item.shortcut
                ? `${item.label} (${item.shortcut})`
                : item.label
            }
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {item.icon}
          </button>
        );
      })}
      <div className="flex-1" />
      <button
        onClick={onToggleSearch}
        title="Search (Cmd+F)"
        className={cn(
          "p-1.5 rounded transition-colors",
          searchActive
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
            : "hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
        )}
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}
