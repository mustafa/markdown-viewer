"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { EditorView } from "@codemirror/view";
import { EditorSettings } from "@/types";
import {
  toggleBold,
  toggleItalic,
  insertLink,
  insertCodeBlock,
} from "@/lib/editor-commands";

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  onEditorViewReady?: (view: EditorView) => void;
}

export default function CodeMirrorEditor({
  value,
  onChange,
  settings,
  onEditorViewReady,
}: CodeMirrorEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    if (editorRef.current?.view && onEditorViewReady) {
      onEditorViewReady(editorRef.current.view);
    }
  }, [onEditorViewReady]);

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const formattingKeymap = useMemo(
    () =>
      keymap.of([
        {
          key: "Mod-b",
          run: (view) => {
            toggleBold(view);
            return true;
          },
        },
        {
          key: "Mod-i",
          run: (view) => {
            toggleItalic(view);
            return true;
          },
        },
        {
          key: "Mod-k",
          run: (view) => {
            insertLink(view);
            return true;
          },
        },
        {
          key: "Mod-Shift-k",
          run: (view) => {
            insertCodeBlock(view);
            return true;
          },
        },
      ]),
    []
  );

  const extensions = useMemo(() => {
    const exts = [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      formattingKeymap,
      EditorView.lineWrapping,
    ];

    if (settings.vimMode) {
      exts.unshift(vim());
    }

    return exts;
  }, [settings.vimMode, formattingKeymap]);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="h-full overflow-auto [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:overflow-auto">
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={handleChange}
        extensions={extensions}
        theme={isDark ? oneDark : "light"}
        basicSetup={{
          lineNumbers: settings.lineNumbers,
          // Cmd/Ctrl+F is the app's search bar (it also drives the editor
          // selection in editor-only view); CodeMirror's own panel would
          // otherwise capture the key while the editor has focus.
          searchKeymap: false,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          indentOnInput: true,
          syntaxHighlighting: true,
        }}
        style={{
          height: "100%",
          fontSize: `${settings.fontSize}px`,
        }}
        className="h-full"
      />
    </div>
  );
}
