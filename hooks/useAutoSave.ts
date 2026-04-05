"use client";

import { useEffect, useRef, useCallback } from "react";
import { MarkdownFile } from "@/types";
import { saveFile } from "@/lib/storage";

export function useAutoSave(file: MarkdownFile | null, delay: number = 1000) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(() => {
    if (file && file.isDirty) {
      saveFile(file);
    }
  }, [file]);

  useEffect(() => {
    if (!file || !file.isDirty) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [file, delay, save]);

  return save;
}
