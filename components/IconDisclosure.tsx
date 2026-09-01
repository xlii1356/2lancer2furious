"use client";
import { useState } from "react";

export function IconDisclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center border border-separator bg-void p-0 text-text-mid hover:text-primary"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="absolute left-0 top-full z-30 mt-2 w-64">{children}</div>}
    </div>
  );
}
