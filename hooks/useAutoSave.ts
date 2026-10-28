"use client";

import { useEffect, useRef, useCallback } from "react";
import { MarkdownFile } from "@/types";
import { saveFile } from "@/lib/storage";

/**
 * Persists every dirty file `delay` ms after the last edit, and immediately
 * when the page is hidden or closed. Works on the whole file list rather than
 * the active file only: switching tabs inside the debounce window used to
 * cancel the previous file's pending save, so its last edits never reached
 * storage. `onSaved` receives the snapshots that were written so the caller
 * can clear the dirty marker (only where the content is still the same).
 */
export function useAutoSave(
  files: MarkdownFile[],
  onSaved: (saved: MarkdownFile[]) => void,
  delay: number = 1000
) {
  const latest = useRef(files);
  useEffect(() => {
    latest.current = files;
  });

  const flush = useCallback(() => {
    const dirty = latest.current.filter((f) => f.isDirty);
    if (dirty.length === 0) return;
    dirty.forEach((f) => saveFile(f));
    onSaved(dirty);
  }, [onSaved]);

  useEffect(() => {
    if (!files.some((f) => f.isDirty)) return;
    const timeout = setTimeout(flush, delay);
    return () => clearTimeout(timeout);
  }, [files, delay, flush]);

  // pagehide fires on close, reload and tab discard; visibilitychange covers
  // mobile Safari, which may skip pagehide when the app is swiped away.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  return flush;
}
