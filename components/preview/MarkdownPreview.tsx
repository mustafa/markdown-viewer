"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Components } from "react-markdown";

interface MarkdownPreviewProps {
  content: string;
  searchQuery?: string;
}

export default function MarkdownPreview({
  content,
  searchQuery,
}: MarkdownPreviewProps) {
  const components: Components = {
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

  const highlightContent = (text: string, query: string): React.ReactNode => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // If there is a search query, we wrap text nodes to highlight matches
  if (searchQuery) {
    components.p = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <p {...props}>{highlighted}</p>;
    };

    components.h1 = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <h1 {...props}>{highlighted}</h1>;
    };
    components.h2 = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <h2 {...props}>{highlighted}</h2>;
    };
    components.h3 = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <h3 {...props}>{highlighted}</h3>;
    };
    components.h4 = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <h4 {...props}>{highlighted}</h4>;
    };
    components.h5 = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <h5 {...props}>{highlighted}</h5>;
    };
    components.h6 = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <h6 {...props}>{highlighted}</h6>;
    };

    // Highlight in list items
    components.li = ({ children, ...props }) => {
      const highlighted = highlightTextNodes(children, searchQuery);
      return <li {...props}>{highlighted}</li>;
    };
  }

  void highlightContent;

  return (
    <div
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightTextNodes(
  children: React.ReactNode,
  query: string
): React.ReactNode {
  if (!query) return children;

  if (typeof children === "string") {
    const parts = children.split(
      new RegExp(`(${escapeRegExp(query)})`, "gi")
    );
    if (parts.length === 1) return children;
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
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
        const result = highlightTextNodes(child, query);
        if (result === child) return child;
        return <span key={i}>{result}</span>;
      }
      return child;
    });
  }

  return children;
}
