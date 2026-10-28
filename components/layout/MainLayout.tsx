"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorView } from "@codemirror/view";
import { MarkdownFile, EditorSettings, ViewMode, Heading } from "@/types";
import { generateId } from "@/lib/markdown";
import { findSample } from "@/lib/samples";
import {
  saveFile,
  loadFiles,
  removeFile,
  saveActiveFileId,
  loadActiveFileId,
  saveOpenFileIds,
  loadOpenFileIds,
  saveSettings,
  loadSettings,
} from "@/lib/storage";
import { exportToHTML, exportToPDF } from "@/lib/export";
import { useAutoSave } from "@/hooks/useAutoSave";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";
import StatusBar from "./StatusBar";
import CodeMirrorEditor from "../editor/CodeMirrorEditor";
import EditorToolbar from "../editor/EditorToolbar";
import MarkdownPreview, { MarkdownBody } from "../preview/MarkdownPreview";
import TableOfContents from "../preview/TableOfContents";
import SearchBar from "../search/SearchBar";
import {
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Download,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CONTENT = `# Untitled

Start writing your markdown here...
`;

const MAX_EDITOR_MATCHES = 5000;

// Byte offsets of every occurrence of `query` in `text`, for the editor-only
// view where the preview (which normally counts matches) is not mounted.
function findMatches(text: string, query: string, caseSensitive: boolean): number[] {
  if (!query) return [];
  const hay = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const out: number[] = [];
  let i = 0;
  while (out.length < MAX_EDITOR_MATCHES) {
    i = hay.indexOf(needle, i);
    if (i === -1) break;
    out.push(i);
    i += needle.length;
  }
  return out;
}

export default function MainLayout() {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [settings, setSettings] = useState<EditorSettings>({
    vimMode: false,
    wordWrap: true,
    lineNumbers: true,
    fontSize: 14,
  });
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCaseSensitive, setSearchCaseSensitive] = useState(false);
  const [previewMatchCount, setPreviewMatchCount] = useState(0);
  const [searchActiveMatch, setSearchActiveMatch] = useState(0);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const initRef = useRef(false);

  const activeFile =
    files.find((f) => f.id === activeFileId) || null;

  // Clear the dirty marker only where the saved snapshot is still current;
  // a keystroke during the save keeps the file dirty for the next pass.
  const handleSaved = useCallback((saved: MarkdownFile[]) => {
    setFiles((prev) =>
      prev.map((f) => {
        const s = saved.find((x) => x.id === f.id);
        return s && s.content === f.content && s.name === f.name
          ? { ...f, isDirty: false }
          : f;
      })
    );
  }, []);

  const flushSave = useAutoSave(files, handleSaved);

  const saveNow = useCallback(() => {
    flushSave();
    setSavedAt(Date.now());
  }, [flushSave]);

  // Load from localStorage on mount. The page is prerendered without
  // storage access, so hydrating state lazily would mismatch the exported
  // HTML; an effect is the right place for this one-time read.
  /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage hydration after mount */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setMounted(true);

    const stored = loadFiles();
    const storedSettings = loadSettings();
    const storedActiveId = loadActiveFileId();
    const storedOpenIds = loadOpenFileIds();

    setSettings(storedSettings);

    if (stored.length > 0) {
      setFiles(stored);
      const validOpenIds = storedOpenIds.filter((id) =>
        stored.some((f) => f.id === id)
      );
      setOpenFileIds(validOpenIds.length > 0 ? validOpenIds : [stored[0].id]);
      if (storedActiveId && stored.some((f) => f.id === storedActiveId)) {
        setActiveFileId(storedActiveId);
      } else {
        setActiveFileId(
          validOpenIds.length > 0 ? validOpenIds[0] : stored[0].id
        );
      }
    } else {
      // Create a default file
      const defaultFile: MarkdownFile = {
        id: generateId(),
        name: "Untitled.md",
        content: DEFAULT_CONTENT,
        lastModified: Date.now(),
        isDirty: false,
      };
      saveFile(defaultFile);
      setFiles([defaultFile]);
      setOpenFileIds([defaultFile.id]);
      setActiveFileId(defaultFile.id);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist open file IDs and active file ID
  useEffect(() => {
    if (mounted) {
      saveOpenFileIds(openFileIds);
    }
  }, [openFileIds, mounted]);

  useEffect(() => {
    if (mounted) {
      saveActiveFileId(activeFileId);
    }
  }, [activeFileId, mounted]);

  useEffect(() => {
    if (mounted) {
      saveSettings(settings);
    }
  }, [settings, mounted]);

  // "Saved" flash in the status bar, cleared after a moment.
  useEffect(() => {
    if (savedAt == null) return;
    const t = setTimeout(() => setSavedAt(null), 1800);
    return () => clearTimeout(t);
  }, [savedAt]);

  const handleContentChange = useCallback(
    (content: string) => {
      if (!activeFileId) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId && f.content !== content
            ? { ...f, content, isDirty: true, lastModified: Date.now() }
            : f
        )
      );
    },
    [activeFileId]
  );

  const addFile = useCallback((name: string, content: string) => {
    const newFile: MarkdownFile = {
      id: generateId(),
      name,
      content,
      lastModified: Date.now(),
      isDirty: false,
    };
    saveFile(newFile);
    setFiles((prev) => [...prev, newFile]);
    setOpenFileIds((prev) => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
  }, []);

  const handleNewFile = useCallback(() => {
    addFile("Untitled.md", DEFAULT_CONTENT);
  }, [addFile]);

  const handleOpenFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = typeof e.target?.result === "string" ? e.target.result : "";
        addFile(file.name, content);
      };
      reader.onerror = () => {
        console.error("Failed to read file:", file.name, reader.error);
      };
      reader.readAsText(file);
    },
    [addFile]
  );

  const handleSelectFile = useCallback((id: string) => {
    setOpenFileIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveFileId(id);
  }, []);

  const handleCloseFile = useCallback(
    (id: string) => {
      const next = openFileIds.filter((fid) => fid !== id);
      setOpenFileIds(next);
      if (activeFileId === id) {
        setActiveFileId(next.length > 0 ? next[next.length - 1] : null);
      }
    },
    [openFileIds, activeFileId]
  );

  const handleDeleteFile = useCallback(
    (id: string) => {
      removeFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      const next = openFileIds.filter((fid) => fid !== id);
      setOpenFileIds(next);
      if (activeFileId === id) {
        setActiveFileId(next.length > 0 ? next[next.length - 1] : null);
      }
    },
    [openFileIds, activeFileId]
  );

  const handleRenameFile = useCallback((id: string, name: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id || f.name === name) return f;
        const renamed = { ...f, name, lastModified: Date.now() };
        saveFile(renamed);
        return { ...renamed, isDirty: false };
      })
    );
  }, []);

  const handleLoadSample = useCallback(
    (filename: string) => {
      const sample = findSample(filename);
      if (!sample) {
        console.error("Unknown sample:", filename);
        return;
      }
      addFile(sample.filename, sample.content);
    },
    [addFile]
  );

  const handleExportHTML = useCallback(() => {
    if (!activeFile) return;
    const previewEl = document.querySelector("[data-preview-content]");
    // In editor-only view the preview is not mounted; render it off-screen.
    const bodyHTML = previewEl
      ? previewEl.innerHTML
      : renderToStaticMarkup(<MarkdownBody content={activeFile.content} />);
    exportToHTML(bodyHTML, activeFile.name);
  }, [activeFile]);

  const handleExportPDF = useCallback(() => {
    exportToPDF();
  }, []);

  const handleEditorViewReady = useCallback((view: EditorView) => {
    setEditorView(view);
  }, []);

  const handleSearchQueryChange = useCallback(
    (query: string, caseSensitive: boolean) => {
      setSearchQuery(query);
      setSearchCaseSensitive(caseSensitive);
      setSearchActiveMatch(query ? 1 : 0);
    },
    []
  );

  // The preview reports how many matches it actually highlighted; keep the
  // active index inside that range.
  const handleSearchMatchCount = useCallback((count: number) => {
    setPreviewMatchCount(count);
    setSearchActiveMatch((prev) =>
      count === 0 ? 0 : Math.min(Math.max(prev, 1), count)
    );
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // Already open: put the cursor back in the box.
    const input = document.querySelector<HTMLInputElement>(
      'input[aria-label="Search in document"]'
    );
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setPreviewMatchCount(0);
    setSearchActiveMatch(0);
  }, []);

  // Editor-only view: the preview is not mounted, so count matches in the
  // source and move the editor selection to the active one.
  const editorMatches = useMemo(
    () =>
      viewMode === "editor" && searchOpen && activeFile
        ? findMatches(activeFile.content, searchQuery, searchCaseSensitive)
        : null,
    [viewMode, searchOpen, activeFile, searchQuery, searchCaseSensitive]
  );
  const searchMatchCount = editorMatches ? editorMatches.length : previewMatchCount;
  const activeMatch =
    searchMatchCount === 0 ? 0 : Math.min(Math.max(searchActiveMatch, 1), searchMatchCount);

  useEffect(() => {
    if (!editorView || viewMode !== "editor" || !searchOpen || !searchQuery) return;
    const pos = findMatches(editorView.state.doc.toString(), searchQuery, searchCaseSensitive);
    const target = pos[Math.min(Math.max(searchActiveMatch, 1), pos.length) - 1];
    if (target == null) return;
    editorView.dispatch({
      selection: { anchor: target, head: target + searchQuery.length },
      effects: EditorView.scrollIntoView(target, { y: "center" }),
    });
    // Runs when the query or the active index changes, not on every keystroke
    // in the editor: re-selecting while typing would move the cursor.
  }, [editorView, viewMode, searchOpen, searchQuery, searchCaseSensitive, searchActiveMatch]);

  // Table of contents: scroll the preview when it is on screen, otherwise
  // put the editor cursor on the heading's line.
  const handleNavigate = useCallback(
    (heading: Heading) => {
      const previewEl = document.querySelector<HTMLElement>("[data-preview-content]");
      const target = previewEl?.querySelector<HTMLElement>(`#${CSS.escape(heading.id)}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (editorView && (!target || viewMode === "split")) {
        const doc = editorView.state.doc;
        const line = doc.line(Math.min(Math.max(heading.line, 1), doc.lines));
        editorView.dispatch({
          selection: { anchor: line.from },
          effects: EditorView.scrollIntoView(line.from, { y: "start", yMargin: 8 }),
        });
        if (!target) editorView.focus();
      }
    },
    [editorView, viewMode]
  );

  // Global shortcuts. Cmd/Ctrl+S would otherwise open the browser's "Save
  // page" dialog, and Cmd/Ctrl+F the browser's find bar.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "f" && !e.shiftKey) {
        e.preventDefault();
        openSearch();
      } else if (key === "s" && !e.shiftKey) {
        e.preventDefault();
        saveNow();
      } else if (key === "\\") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      } else if (key === "e" && e.shiftKey) {
        e.preventDefault();
        setViewMode((m) => (m === "split" ? "editor" : m === "editor" ? "preview" : "split"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch, saveNow]);

  // Handle image drag-and-drop into the editor
  const handleEditorDrop = useCallback(
    (e: React.DragEvent) => {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      e.preventDefault();
      e.stopPropagation();

      imageFiles.forEach((imgFile) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          if (editorView) {
            const pos = editorView.state.selection.main.head;
            const insertion = `![${imgFile.name}](${base64})\n`;
            editorView.dispatch({
              changes: { from: pos, insert: insertion },
            });
          }
        };
        reader.readAsDataURL(imgFile);
      });
    },
    [editorView]
  );

  const openFiles = files.filter((f) => openFileIds.includes(f.id));

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-neutral-400 dark:text-neutral-500 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={sidebarOpen ? "Hide sidebar (Cmd+\\)" : "Show sidebar (Cmd+\\)"}
            aria-pressed={sidebarOpen}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4 text-neutral-500" />
            ) : (
              <PanelLeftOpen className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          <h1 className="text-sm font-semibold tracking-tight text-neutral-700 dark:text-neutral-300">
            Markdown Viewer
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            title="Table of Contents"
            aria-pressed={tocOpen}
            className={cn(
              "p-1.5 rounded transition-colors",
              tocOpen
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            )}
          >
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportHTML}
            title="Export as HTML"
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors disabled:opacity-40"
            disabled={!activeFile}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportPDF}
            title="Print / Export as PDF"
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors disabled:opacity-40"
            disabled={!activeFile}
          >
            <FileDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-56 shrink-0 relative">
            <Sidebar
              files={files}
              activeFileId={activeFileId}
              onSelectFile={handleSelectFile}
              onNewFile={handleNewFile}
              onOpenFile={handleOpenFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              onLoadSample={handleLoadSample}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TabBar
            files={openFiles}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCloseFile={handleCloseFile}
          />

          {activeFile ? (
            <>
              {(viewMode === "editor" || viewMode === "split") && (
                <EditorToolbar
                  editorView={editorView}
                  onToggleSearch={() => (searchOpen ? closeSearch() : openSearch())}
                  searchActive={searchOpen}
                />
              )}
              {searchOpen && (
                <SearchBar
                  matchCount={searchMatchCount}
                  activeMatch={activeMatch}
                  onClose={closeSearch}
                  onQueryChange={handleSearchQueryChange}
                  onActiveMatchChange={setSearchActiveMatch}
                />
              )}
              <div className="flex flex-1 overflow-hidden">
                {(viewMode === "editor" || viewMode === "split") && (
                  <div
                    className={cn(
                      "flex flex-col overflow-hidden",
                      viewMode === "split"
                        ? "w-1/2 border-r border-neutral-200 dark:border-neutral-800"
                        : "w-full"
                    )}
                    onDrop={handleEditorDrop}
                    onDragOver={(e) => {
                      if (
                        Array.from(e.dataTransfer.types).includes("Files")
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {/* Keyed by file so each document gets its own editor
                        state: a shared editor let Cmd+Z undo across tabs and
                        restore another file's text into this one. */}
                    <CodeMirrorEditor
                      key={activeFile.id}
                      value={activeFile.content}
                      onChange={handleContentChange}
                      settings={settings}
                      onEditorViewReady={handleEditorViewReady}
                    />
                  </div>
                )}
                {(viewMode === "preview" || viewMode === "split") && (
                  <div
                    className={cn(
                      "overflow-hidden flex",
                      viewMode === "split" ? "w-1/2" : "w-full"
                    )}
                  >
                    <div className="flex-1 overflow-auto min-w-0">
                      <MarkdownPreview
                        content={activeFile.content}
                        searchQuery={searchQuery}
                        caseSensitive={searchCaseSensitive}
                        activeMatch={activeMatch}
                        onMatchCount={handleSearchMatchCount}
                      />
                    </div>
                    {tocOpen && (
                      <div className="w-56 shrink-0 border-l border-neutral-200 dark:border-neutral-800 overflow-auto">
                        <TableOfContents content={activeFile.content} onNavigate={handleNavigate} />
                      </div>
                    )}
                  </div>
                )}
                {viewMode === "editor" && tocOpen && (
                  <div className="w-56 shrink-0 border-l border-neutral-200 dark:border-neutral-800 overflow-auto">
                    <TableOfContents content={activeFile.content} onNavigate={handleNavigate} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
              <div className="text-center">
                <p className="text-lg mb-2">No file open</p>
                <p className="text-sm">
                  Create a new file or open one from the sidebar
                </p>
              </div>
            </div>
          )}

          <StatusBar
            content={activeFile?.content || ""}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            settings={settings}
            onSettingsChange={setSettings}
            isDirty={!!activeFile?.isDirty}
            savedFlash={savedAt != null}
          />
        </div>
      </div>
    </div>
  );
}
