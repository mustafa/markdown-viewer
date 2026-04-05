import { MarkdownFile, EditorSettings } from "@/types";

const FILES_KEY = "markdown-viewer-files";
const ACTIVE_FILE_KEY = "markdown-viewer-active-file";
const SETTINGS_KEY = "markdown-viewer-settings";
const OPEN_FILE_IDS_KEY = "markdown-viewer-open-file-ids";

export function saveFile(file: MarkdownFile): void {
  const files = loadFiles();
  const index = files.findIndex((f) => f.id === file.id);
  const updatedFile = { ...file, lastModified: Date.now(), isDirty: false };
  if (index >= 0) {
    files[index] = updatedFile;
  } else {
    files.push(updatedFile);
  }
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function loadFiles(): MarkdownFile[] {
  try {
    const raw = localStorage.getItem(FILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MarkdownFile[];
  } catch {
    return [];
  }
}

export function removeFile(id: string): void {
  const files = loadFiles().filter((f) => f.id !== id);
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function saveActiveFileId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_FILE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_FILE_KEY);
  }
}

export function loadActiveFileId(): string | null {
  return localStorage.getItem(ACTIVE_FILE_KEY);
}

export function saveOpenFileIds(ids: string[]): void {
  localStorage.setItem(OPEN_FILE_IDS_KEY, JSON.stringify(ids));
}

export function loadOpenFileIds(): string[] {
  try {
    const raw = localStorage.getItem(OPEN_FILE_IDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveSettings(settings: EditorSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return JSON.parse(raw) as EditorSettings;
  } catch {
    return defaultSettings();
  }
}

function defaultSettings(): EditorSettings {
  return {
    vimMode: false,
    wordWrap: true,
    lineNumbers: true,
    fontSize: 14,
  };
}
