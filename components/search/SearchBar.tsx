"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown, CaseSensitive } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  /** Number of matches currently highlighted in the preview. */
  matchCount: number;
  /** 1-based index of the active match, 0 when there is none. */
  activeMatch: number;
  onClose: () => void;
  onQueryChange: (query: string, caseSensitive: boolean) => void;
  onActiveMatchChange: (index: number) => void;
}

export default function SearchBar({
  matchCount,
  activeMatch,
  onClose,
  onQueryChange,
  onActiveMatchChange,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const updateQuery = useCallback(
    (nextQuery: string, nextCaseSensitive: boolean) => {
      setQuery(nextQuery);
      setCaseSensitive(nextCaseSensitive);
      onQueryChange(nextQuery, nextCaseSensitive);
    },
    [onQueryChange]
  );

  const handleNext = useCallback(() => {
    if (matchCount > 0) {
      onActiveMatchChange((activeMatch % matchCount) + 1);
    }
  }, [matchCount, activeMatch, onActiveMatchChange]);

  const handlePrev = useCallback(() => {
    if (matchCount > 0) {
      onActiveMatchChange(activeMatch <= 1 ? matchCount : activeMatch - 1);
    }
  }, [matchCount, activeMatch, onActiveMatchChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter") {
        if (e.shiftKey) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    },
    [onClose, handleNext, handlePrev]
  );

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center flex-1 gap-2 bg-white dark:bg-neutral-800 rounded-md border border-neutral-300 dark:border-neutral-600 px-2 py-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => updateQuery(e.target.value, caseSensitive)}
          onKeyDown={handleKeyDown}
          placeholder="Search in document..."
          aria-label="Search in document"
          className="flex-1 bg-transparent text-sm outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
        />
        <button
          onClick={() => updateQuery(query, !caseSensitive)}
          title="Match case"
          aria-pressed={caseSensitive}
          className={cn(
            "p-0.5 rounded transition-colors",
            caseSensitive
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          )}
        >
          <CaseSensitive className="h-4 w-4" />
        </button>
      </div>
      <span
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400 min-w-[60px] text-center"
      >
        {query
          ? matchCount > 0
            ? `${activeMatch}/${matchCount}`
            : "No results"
          : ""}
      </span>
      <button
        onClick={handlePrev}
        disabled={matchCount === 0}
        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 disabled:opacity-30"
        title="Previous match"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        onClick={handleNext}
        disabled={matchCount === 0}
        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 disabled:opacity-30"
        title="Next match"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
        title="Close search"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
