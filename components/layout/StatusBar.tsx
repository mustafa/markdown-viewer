"use client";

import { countWords, estimateReadingTime } from "@/lib/markdown";
import { ViewMode, EditorSettings } from "@/types";
import {
  Columns2,
  PanelLeft,
  PanelRight,
  Moon,
  Sun,
  Settings,
  Keyboard,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  content: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}

export default function StatusBar({
  content,
  viewMode,
  onViewModeChange,
  settings,
  onSettingsChange,
}: StatusBarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const words = countWords(content);
  const readingTime = estimateReadingTime(content);
  const lines = content.split("\n").length;
  const chars = content.length;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-between px-3 py-1 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span>{words} words</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>{chars} chars</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>{lines} lines</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>{readingTime} min read</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSettingsChange({ ...settings, vimMode: !settings.vimMode })}
          title={settings.vimMode ? "Vim mode ON" : "Vim mode OFF"}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors",
            settings.vimMode
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
          )}
        >
          <Keyboard className="h-3 w-3" />
          <span>VIM</span>
        </button>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
        <button
          onClick={() =>
            onSettingsChange({
              ...settings,
              fontSize: Math.max(10, settings.fontSize - 1),
            })
          }
          className="px-1.5 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Decrease font size"
        >
          A-
        </button>
        <span className="min-w-[28px] text-center">{settings.fontSize}px</span>
        <button
          onClick={() =>
            onSettingsChange({
              ...settings,
              fontSize: Math.min(24, settings.fontSize + 1),
            })
          }
          className="px-1.5 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Increase font size"
        >
          A+
        </button>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
        <button
          onClick={() =>
            onSettingsChange({
              ...settings,
              lineNumbers: !settings.lineNumbers,
            })
          }
          title="Toggle line numbers"
          className={cn(
            "px-1.5 py-0.5 rounded transition-colors",
            settings.lineNumbers
              ? "bg-neutral-200 dark:bg-neutral-700"
              : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
          )}
        >
          <Settings className="h-3 w-3" />
        </button>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
        <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange("editor")}
            title="Editor only"
            className={cn(
              "p-1 transition-colors",
              viewMode === "editor"
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("split")}
            title="Split view"
            className={cn(
              "p-1 transition-colors",
              viewMode === "split"
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("preview")}
            title="Preview only"
            className={cn(
              "p-1 transition-colors",
              viewMode === "preview"
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <PanelRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
        <button
          onClick={toggleTheme}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
