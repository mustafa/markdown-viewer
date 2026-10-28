"use client";

import { useEffect, useMemo, useState } from "react";
import { extractHeadings } from "@/lib/markdown";
import { Heading } from "@/types";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  content: string;
  /** Navigate to a heading; the layout decides between preview and editor. */
  onNavigate: (heading: Heading) => void;
}

const HEADING_SELECTOR = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";

export default function TableOfContents({
  content,
  onNavigate,
}: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Scroll spy: the last rendered heading at or above the top of the preview
  // scroller is the active one. Listening in the capture phase on the
  // document catches scrolls from whichever ancestor actually scrolls.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.querySelector<HTMLElement>("[data-preview-content]");
      const rendered = root
        ? Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR))
        : [];
      if (!root || rendered.length === 0) {
        setActiveId(null);
        return;
      }
      const top = root.getBoundingClientRect().top + 12;
      let current = rendered[0];
      for (const el of rendered) {
        if (el.getBoundingClientRect().top <= top) current = el;
        else break;
      }
      setActiveId(current.id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    return () => {
      document.removeEventListener("scroll", schedule, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length === 0) {
    return (
      <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
        No headings found
      </div>
    );
  }

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="p-4 overflow-auto h-full" aria-label="Table of contents">
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
              onClick={() => onNavigate(heading)}
              aria-current={activeId === heading.id ? "location" : undefined}
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
