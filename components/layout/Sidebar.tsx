"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FilePlus,
  FolderOpen,
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MarkdownFile } from "@/types";
import { SAMPLES } from "@/lib/samples";
import { cn } from "@/lib/utils";

interface SidebarProps {
  files: MarkdownFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onOpenFile: (file: File) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onLoadSample: (filename: string) => void;
}

const isMarkdownName = (name: string) =>
  /\.(md|markdown|mdown|mkd|txt)$/i.test(name);

export default function Sidebar({
  files,
  activeFileId,
  onSelectFile,
  onNewFile,
  onOpenFile,
  onDeleteFile,
  onRenameFile,
  onLoadSample,
}: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renamingId) return;
    const input = renameInputRef.current;
    if (!input) return;
    input.focus();
    // Select the stem so typing replaces the name but keeps the extension.
    const dot = input.value.lastIndexOf(".");
    input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
  }, [renamingId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.filter((f) => isMarkdownName(f.name)).forEach((f) => onOpenFile(f));
    },
    [onOpenFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        Array.from(selectedFiles).forEach((f) => onOpenFile(f));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onOpenFile]
  );

  const startRename = useCallback((file: MarkdownFile) => {
    setRenamingId(file.id);
    setDraftName(file.name);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const name = draftName.trim();
    if (name) onRenameFile(renamingId, name);
    setRenamingId(null);
  }, [renamingId, draftName, onRenameFile]);

  const cancelRename = useCallback(() => setRenamingId(null), []);

  const confirmDelete = useCallback(
    (file: MarkdownFile) => {
      if (window.confirm(`Delete "${file.name}"? This cannot be undone.`)) {
        onDeleteFile(file.id);
      }
    },
    [onDeleteFile]
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-colors",
        isDragOver && "bg-blue-50 dark:bg-blue-950/20"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1">
          <button
            onClick={onNewFile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            title="New file"
          >
            <FilePlus className="h-3.5 w-3.5" />
            New
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Open file"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Open
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.mdown,.mkd,.txt"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-auto">
        {files.length > 0 && (
          <div className="py-2">
            <h3 className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Files
            </h3>
            <ul>
              {files.map((file) => (
                <li key={file.id} className="group relative">
                  {renamingId === file.id ? (
                    <div className="flex items-center gap-2 px-3 py-1">
                      <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
                      <input
                        ref={renameInputRef}
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelRename();
                          }
                        }}
                        aria-label="File name"
                        className="flex-1 min-w-0 text-sm px-1 py-0.5 rounded border border-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onSelectFile(file.id)}
                        onDoubleClick={() => startRename(file)}
                        title={`${file.name} (double-click to rename)`}
                        className={cn(
                          "flex items-center gap-2 w-full pl-3 pr-8 py-1.5 text-sm transition-colors",
                          activeFileId === file.id
                            ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1 text-left">
                          {file.name}
                        </span>
                        {file.isDirty && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                            title="Unsaved changes"
                          />
                        )}
                      </button>
                      <button
                        onClick={() => confirmDelete(file)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-opacity text-neutral-500 dark:text-neutral-400"
                        title="Delete"
                        aria-label={`Delete ${file.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="py-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setSamplesOpen(!samplesOpen)}
            aria-expanded={samplesOpen}
            className="flex items-center gap-1 px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 w-full"
          >
            {samplesOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Samples
          </button>
          {samplesOpen && (
            <ul>
              {SAMPLES.map((sample) => (
                <li key={sample.filename}>
                  <button
                    onClick={() => onLoadSample(sample.filename)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{sample.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-950/90 pointer-events-none">
          <div className="text-center">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Drop files here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
