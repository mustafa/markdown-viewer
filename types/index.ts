export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  path?: string;
  lastModified: number;
  isDirty: boolean;
}

export interface EditorSettings {
  vimMode: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  fontSize: number;
}

export type ViewMode = 'editor' | 'preview' | 'split';

export interface Heading {
  level: number;
  text: string;
  /** Element id in the rendered preview (github-slugger, same as rehype-slug). */
  id: string;
  /** 1-based source line, for navigating the editor when the preview is hidden. */
  line: number;
}

export interface SearchState {
  query: string;
  caseSensitive: boolean;
  matchCount: number;
  currentMatch: number;
}
