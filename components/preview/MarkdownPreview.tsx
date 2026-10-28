"use client";

import { cloneElement, isValidElement, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Components } from "react-markdown";

interface MarkdownPreviewProps {
  content: string;
  searchQuery?: string;
  caseSensitive?: boolean;
  /** 1-based index of the match to scroll into view, 0 for none. */
  activeMatch?: number;
  /** Reports how many matches are highlighted after each render. */
  onMatchCount?: (count: number) => void;
}

export default function MarkdownPreview({
  content,
  searchQuery,
  caseSensitive = false,
  activeMatch = 0,
  onMatchCount,
}: MarkdownPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // After the highlighted markup is in the DOM, report the real match count
  // and scroll the active match into view.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const marks = root.querySelectorAll<HTMLElement>("mark[data-search-match]");
    onMatchCount?.(searchQuery ? marks.length : 0);
    marks.forEach((mark, i) => {
      mark.toggleAttribute("data-active", i + 1 === activeMatch);
    });
    const active = marks[activeMatch - 1];
    if (active) {
      active.scrollIntoView({ block: "center" });
    }
  }, [content, searchQuery, caseSensitive, activeMatch, onMatchCount]);

  return (
    <div
      ref={containerRef}
      data-preview-content
      className="prose prose-neutral dark:prose-invert max-w-none p-6 overflow-auto h-full
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-h1:text-3xl prose-h1:border-b prose-h1:border-neutral-200 prose-h1:dark:border-neutral-700 prose-h1:pb-2 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:border-b prose-h2:border-neutral-200 prose-h2:dark:border-neutral-700 prose-h2:pb-2 prose-h2:mb-3
        prose-h3:text-xl
        prose-p:leading-relaxed
        prose-li:my-1
        prose-pre:p-0 prose-pre:bg-transparent
      "
    >
      <MarkdownBody
        content={content}
        searchQuery={searchQuery}
        caseSensitive={caseSensitive}
      />
    </div>
  );
}

interface MarkdownBodyProps {
  content: string;
  searchQuery?: string;
  caseSensitive?: boolean;
}

/**
 * The rendered document on its own (no scroll container, no effects), so the
 * HTML export can render it off-screen when the preview pane is hidden.
 */
export function MarkdownBody({
  content,
  searchQuery,
  caseSensitive = false,
}: MarkdownBodyProps) {
  // Memoized so the preview DOM is not remounted on every parent render
  // (which happened on each editor keystroke and also wiped the active-match
  // attribute set by the effect above).
  const components = useMemo(
    () => buildComponents(searchQuery, caseSensitive),
    [searchQuery, caseSensitive]
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

function buildComponents(searchQuery?: string, caseSensitive = false): Components {
  const base: Components = {
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full border-collapse border border-neutral-300 dark:border-neutral-600"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="border border-neutral-300 dark:border-neutral-600 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 font-semibold text-left"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="border border-neutral-300 dark:border-neutral-600 px-4 py-2"
        {...props}
      >
        {children}
      </td>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 my-4 text-neutral-600 dark:text-neutral-400 italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, className, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="bg-neutral-900 dark:bg-neutral-950 text-neutral-100 rounded-lg p-4 my-4 overflow-x-auto text-sm font-mono leading-relaxed"
        {...props}
      >
        {children}
      </pre>
    ),
    img: ({ src, alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ""}
        className="max-w-full h-auto rounded-lg my-4"
        loading="lazy"
        {...props}
      />
    ),
    hr: (props) => (
      <hr
        className="my-8 border-neutral-200 dark:border-neutral-700"
        {...props}
      />
    ),
    input: ({ type, checked, ...props }) => {
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 rounded"
            {...props}
          />
        );
      }
      return <input type={type} {...props} />;
    },
  };

  // If there is a search query, we wrap text nodes to highlight matches
  if (searchQuery) {
    const highlight = (children: React.ReactNode) =>
      highlightTextNodes(children, searchQuery, caseSensitive);

    base.p = ({ children, ...props }) => (
      <p {...props}>{highlight(children)}</p>
    );
    base.h1 = ({ children, ...props }) => (
      <h1 {...props}>{highlight(children)}</h1>
    );
    base.h2 = ({ children, ...props }) => (
      <h2 {...props}>{highlight(children)}</h2>
    );
    base.h3 = ({ children, ...props }) => (
      <h3 {...props}>{highlight(children)}</h3>
    );
    base.h4 = ({ children, ...props }) => (
      <h4 {...props}>{highlight(children)}</h4>
    );
    base.h5 = ({ children, ...props }) => (
      <h5 {...props}>{highlight(children)}</h5>
    );
    base.h6 = ({ children, ...props }) => (
      <h6 {...props}>{highlight(children)}</h6>
    );
    // Highlight in list items
    base.li = ({ children, ...props }) => (
      <li {...props}>{highlight(children)}</li>
    );
    // ...and table cells, which the preview used to skip entirely.
    base.th = ({ children, ...props }) => (
      <th
        className="border border-neutral-300 dark:border-neutral-600 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 font-semibold text-left"
        {...props}
      >
        {highlight(children)}
      </th>
    );
    base.td = ({ children, ...props }) => (
      <td
        className="border border-neutral-300 dark:border-neutral-600 px-4 py-2"
        {...props}
      >
        {highlight(children)}
      </td>
    );
  }
  return base;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightTextNodes(
  children: React.ReactNode,
  query: string,
  caseSensitive: boolean
): React.ReactNode {
  if (!query) return children;

  if (typeof children === "string") {
    const flags = caseSensitive ? "g" : "gi";
    const parts = children.split(
      new RegExp(`(${escapeRegExp(query)})`, flags)
    );
    if (parts.length === 1) return children;
    const isMatch = (part: string) =>
      caseSensitive
        ? part === query
        : part.toLowerCase() === query.toLowerCase();
    return parts.map((part, i) =>
      isMatch(part) ? (
        <mark
          key={i}
          data-search-match
          className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5 data-active:bg-orange-300 dark:data-active:bg-orange-600 data-active:ring-2 data-active:ring-orange-400"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        const result = highlightTextNodes(child, query, caseSensitive);
        if (result === child) return child;
        return <span key={i}>{result}</span>;
      }
      return highlightElement(child, query, caseSensitive, i);
    });
  }

  return highlightElement(children, query, caseSensitive);
}

// Recurse into inline elements (strong, em, a, inline code, ...) so a match
// inside bold or linked text is found too. Fenced code keeps its syntax
// highlighting spans, so it is left alone.
function highlightElement(
  node: React.ReactNode,
  query: string,
  caseSensitive: boolean,
  key?: number
): React.ReactNode {
  if (!isValidElement<{ children?: React.ReactNode; className?: string }>(node)) return node;
  if (node.type === "pre" || node.type === "mark") return node;
  const inner = node.props.children;
  if (inner == null) return node;
  const result = highlightTextNodes(inner, query, caseSensitive);
  if (result === inner) return node;
  return cloneElement(node, key == null ? {} : { key }, result);
}
