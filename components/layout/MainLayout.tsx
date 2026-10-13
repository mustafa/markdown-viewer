"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { MarkdownFile, EditorSettings, ViewMode } from "@/types";
import { generateId } from "@/lib/markdown";
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
import MarkdownPreview from "../preview/MarkdownPreview";
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
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [searchActiveMatch, setSearchActiveMatch] = useState(0);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [mounted, setMounted] = useState(false);
  const initRef = useRef(false);

  const activeFile =
    files.find((f) => f.id === activeFileId) || null;

  useAutoSave(activeFile);

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

  const handleContentChange = useCallback(
    (content: string) => {
      if (!activeFileId) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? { ...f, content, isDirty: true, lastModified: Date.now() }
            : f
        )
      );
    },
    [activeFileId]
  );

  const handleNewFile = useCallback(() => {
    const newFile: MarkdownFile = {
      id: generateId(),
      name: "Untitled.md",
      content: DEFAULT_CONTENT,
      lastModified: Date.now(),
      isDirty: false,
    };
    saveFile(newFile);
    setFiles((prev) => [...prev, newFile]);
    setOpenFileIds((prev) => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
  }, []);

  const handleOpenFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newFile: MarkdownFile = {
        id: generateId(),
        name: file.name,
        content,
        lastModified: Date.now(),
        isDirty: false,
      };
      saveFile(newFile);
      setFiles((prev) => [...prev, newFile]);
      setOpenFileIds((prev) => [...prev, newFile.id]);
      setActiveFileId(newFile.id);
    };
    reader.readAsText(file);
  }, []);

  const handleSelectFile = useCallback(
    (id: string) => {
      if (!openFileIds.includes(id)) {
        setOpenFileIds((prev) => [...prev, id]);
      }
      setActiveFileId(id);
    },
    [openFileIds]
  );

  const handleCloseFile = useCallback(
    (id: string) => {
      setOpenFileIds((prev) => {
        const next = prev.filter((fid) => fid !== id);
        if (activeFileId === id) {
          setActiveFileId(next.length > 0 ? next[next.length - 1] : null);
        }
        return next;
      });
    },
    [activeFileId]
  );

  const handleDeleteFile = useCallback(
    (id: string) => {
      removeFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setOpenFileIds((prev) => {
        const next = prev.filter((fid) => fid !== id);
        if (activeFileId === id) {
          setActiveFileId(next.length > 0 ? next[next.length - 1] : null);
        }
        return next;
      });
    },
    [activeFileId]
  );

  const handleLoadSample = useCallback(async (filename: string) => {
    try {
      const res = await fetch(`/samples/${filename}`);
      const content = await res.text();
      const newFile: MarkdownFile = {
        id: generateId(),
        name: filename,
        content,
        lastModified: Date.now(),
        isDirty: false,
      };
      saveFile(newFile);
      setFiles((prev) => [...prev, newFile]);
      setOpenFileIds((prev) => [...prev, newFile.id]);
      setActiveFileId(newFile.id);
    } catch (err) {
      console.error("Failed to load sample:", err);
    }
  }, []);

  const handleExportHTML = useCallback(() => {
    if (!activeFile) return;
    exportToHTML(activeFile.content, activeFile.name);
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
    setSearchMatchCount(count);
    setSearchActiveMatch((prev) =>
      count === 0 ? 0 : Math.min(Math.max(prev, 1), count)
    );
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchMatchCount(0);
    setSearchActiveMatch(0);
  }, []);

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
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
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
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
            disabled={!activeFile}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportPDF}
            title="Print / Export as PDF"
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
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
              onLoadSample={handleLoadSample}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                  onToggleSearch={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                  searchActive={searchOpen}
                />
              )}
              {searchOpen && (
                <SearchBar
                  matchCount={searchMatchCount}
                  activeMatch={searchActiveMatch}
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
                    <CodeMirrorEditor
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
                    <div className="flex-1 overflow-auto">
                      <MarkdownPreview
                        content={activeFile.content}
                        searchQuery={searchQuery}
                        caseSensitive={searchCaseSensitive}
                        activeMatch={searchActiveMatch}
                        onMatchCount={handleSearchMatchCount}
                      />
                    </div>
                    {tocOpen && (
                      <div className="w-56 shrink-0 border-l border-neutral-200 dark:border-neutral-800 overflow-auto">
                        <TableOfContents content={activeFile.content} />
                      </div>
                    )}
                  </div>
                )}
                {viewMode === "editor" && tocOpen && (
                  <div className="w-56 shrink-0 border-l border-neutral-200 dark:border-neutral-800 overflow-auto">
                    <TableOfContents content={activeFile.content} />
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
          />
        </div>
      </div>
    </div>
  );
}
