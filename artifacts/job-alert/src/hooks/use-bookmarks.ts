import { useState, useEffect } from "react";
import type { Job } from "@workspace/api-client-react";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Job[]>([]);

  // Load initial from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("job-bookmarks");
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load bookmarks", e);
    }
  }, []);

  const toggleBookmark = (job: Job) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.some((b) => b.id === job.id);
      let next;
      if (isBookmarked) {
        next = prev.filter((b) => b.id !== job.id);
      } else {
        next = [...prev, job];
      }
      localStorage.setItem("job-bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const isBookmarked = (id: number) => {
    return bookmarks.some((b) => b.id === id);
  };

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
  };
}
