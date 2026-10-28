import GithubSlugger from "github-slugger";
import { Heading } from "@/types";

export function countWords(content: string): number {
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/[#*_~\[\]()>|+-]/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

export function estimateReadingTime(content: string): number {
  const words = countWords(content);
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

// The text a heading renders as: inline markup stripped the way the preview
// renders it, so the slug below matches the id rehype-slug gives the element.
function inlineText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/\\([\\`*_{}[\]()#+\-.!~])/g, "$1")
    .trim();
}

// ATX headings outside fenced code blocks. Ids come from github-slugger, the
// same slugger rehype-slug uses for the preview, so the table of contents
// lands on the rendered element even for punctuation and repeated headings
// ("Setup", "Setup" -> setup, setup-1). `line` is 1-based for the editor.
export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let fence: string | null = null;

  content.split("\n").forEach((line, index) => {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      return;
    }
    if (fence) return;

    const match = line.match(/^ {0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/);
    if (!match) return;
    const text = inlineText(match[2]);
    if (!text) return;
    headings.push({
      level: match[1].length,
      text,
      id: slugger.slug(text),
      line: index + 1,
    });
  });
  return headings;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
