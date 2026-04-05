"use client";

import { useState, useCallback, useRef } from "react";
import {
  FilePlus,
  FolderOpen,
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MarkdownFile } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  files: MarkdownFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onOpenFile: (file: File) => void;
  onDeleteFile: (id: string) => void;
  onLoadSample: (filename: string) => void;
}

export default function Sidebar({
  files,
  activeFileId,
  onSelectFile,
  onNewFile,
  onOpenFile,
  onDeleteFile,
  onLoadSample,
}: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const mdFiles = droppedFiles.filter(
        (f) => f.name.endsWith(".md") || f.name.endsWith(".markdown") || f.name.endsWith(".txt")
      );
      mdFiles.forEach((f) => onOpenFile(f));
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

  const samples = [
    { name: "Welcome", filename: "welcome.md" },
    { name: "GFM Demo", filename: "sample-gfm.md" },
  ];

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
          accept=".md,.markdown,.txt"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-auto">
        {files.length > 0 && (
          <div className="py-2">
            <h3 className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Open Files
            </h3>
            <ul>
              {files.map((file) => (
                <li key={file.id}>
                  <button
                    onClick={() => onSelectFile(file.id)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-1.5 text-sm transition-colors group",
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
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-opacity shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="py-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setSamplesOpen(!samplesOpen)}
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
              {samples.map((sample) => (
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
