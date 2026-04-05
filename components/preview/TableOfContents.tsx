"use client";

import { useMemo } from "react";
import { extractHeadings } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  content: string;
  activeId?: string;
}

export default function TableOfContents({
  content,
  activeId,
}: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) {
    return (
      <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
        No headings found
      </div>
    );
  }

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="p-4 overflow-auto h-full">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        Table of Contents
      </h3>
      <ul className="space-y-1">
        {headings.map((heading, index) => (
          <li
            key={`${heading.id}-${index}`}
            style={{ paddingLeft: `${(heading.level - minLevel) * 12}px` }}
          >
            <button
              onClick={() => {
                const el = document.getElementById(heading.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className={cn(
                "text-sm truncate block w-full text-left py-0.5 px-2 rounded transition-colors",
                activeId === heading.id
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
              title={heading.text}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
