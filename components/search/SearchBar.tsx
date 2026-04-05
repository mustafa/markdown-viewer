"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown, CaseSensitive } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  content: string;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

export default function SearchBar({
  content,
  onClose,
  onQueryChange,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query) {
      setMatchCount(0);
      setCurrentMatch(0);
      onQueryChange("");
      return;
    }

    const flags = caseSensitive ? "g" : "gi";
    try {
      const regex = new RegExp(escapeRegExp(query), flags);
      const matches = content.match(regex);
      setMatchCount(matches?.length || 0);
      setCurrentMatch(matches && matches.length > 0 ? 1 : 0);
      onQueryChange(query);
    } catch {
      setMatchCount(0);
      setCurrentMatch(0);
    }
  }, [query, content, caseSensitive, onQueryChange]);

  const handleNext = useCallback(() => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev % matchCount) + 1);
    }
  }, [matchCount]);

  const handlePrev = useCallback(() => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev <= 1 ? matchCount : prev - 1));
    }
  }, [matchCount]);

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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search in document..."
          className="flex-1 bg-transparent text-sm outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
        />
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          title="Match case"
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
      <span className="text-xs text-neutral-500 dark:text-neutral-400 min-w-[60px] text-center">
        {query
          ? matchCount > 0
            ? `${currentMatch}/${matchCount}`
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

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
