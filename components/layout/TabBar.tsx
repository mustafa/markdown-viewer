"use client";

import { X } from "lucide-react";
import { MarkdownFile } from "@/types";
import { cn } from "@/lib/utils";

interface TabBarProps {
  files: MarkdownFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
}

export default function TabBar({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
}: TabBarProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-x-auto shrink-0">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "group flex items-center gap-1.5 px-3 py-2 text-sm border-r border-neutral-200 dark:border-neutral-800 cursor-pointer transition-colors min-w-0 shrink-0",
            activeFileId === file.id
              ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300"
          )}
          onClick={() => onSelectFile(file.id)}
        >
          <span className="truncate max-w-[140px]">{file.name}</span>
          {file.isDirty && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unsaved changes" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseFile(file.id);
            }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-opacity shrink-0"
            title="Close"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
