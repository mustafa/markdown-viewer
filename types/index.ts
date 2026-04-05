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
  id: string;
}

export interface SearchState {
  query: string;
  caseSensitive: boolean;
  matchCount: number;
  currentMatch: number;
}
