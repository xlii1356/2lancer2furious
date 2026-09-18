"use client";
import { useState } from "react";

export function NotesToggle({ readView, editView }: { readView: React.ReactNode; editView: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="flex h-8 w-8 items-center justify-center border border-separator bg-void p-0 text-text-mid hover:text-primary"
        aria-label={editing ? "View notes" : "Edit notes"}
      >
        {editing ? (
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="mt-3 w-full">{editing ? editView : readView}</div>
    </div>
  );
}
