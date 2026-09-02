"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Row = { id: string; name: string; uploadedByName: string; createdAt: string };

export function ScanTable({ scans }: { scans: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scans;
    return scans.filter((s) => s.name.toLowerCase().includes(q) || s.uploadedByName.toLowerCase().includes(q));
  }, [scans, query]);

  return (
    <div>
      <input
        type="search"
        placeholder="Filter by name or uploader..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />
      <div className="mt-3 max-h-[480px] overflow-y-auto border border-separator bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-separator">
              <th className="px-4 py-2 font-eyebrow text-xs font-bold uppercase tracking-widest text-text-mid">Name</th>
              <th className="px-4 py-2 font-eyebrow text-xs font-bold uppercase tracking-widest text-text-mid">Uploaded by</th>
              <th className="px-4 py-2 font-eyebrow text-xs font-bold uppercase tracking-widest text-text-mid">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((scan) => (
              <tr key={scan.id} className="border-b border-separator/50 last:border-0 hover:bg-white/5">
                <td className="px-4 py-2">
                  <Link href={`/scans/${scan.id}`} className="text-text-hi hover:text-primary">
                    {scan.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-text-mid">{scan.uploadedByName}</td>
                <td className="px-4 py-2 text-text-mid">{scan.createdAt}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-text-mid">
                  {scans.length ? "No scans match that filter." : "No scans uploaded yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
