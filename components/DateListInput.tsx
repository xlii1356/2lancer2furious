"use client";
import { useState } from "react";

export function DateListInput({ name, defaultValue }: { name: string; defaultValue?: string[] }) {
  const [dates, setDates] = useState<string[]>(defaultValue?.length ? defaultValue : [""]);

  function update(i: number, value: string) {
    setDates((d) => d.map((v, idx) => (idx === i ? value : v)));
  }
  function remove(i: number) {
    setDates((d) => (d.length === 1 ? [""] : d.filter((_, idx) => idx !== i)));
  }
  function add() {
    setDates((d) => [...d, ""]);
  }

  return (
    <div className="space-y-2">
      {dates.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="date" name={name} value={d} onChange={(e) => update(i, e.target.value)} className="w-auto" />
          <button type="button" onClick={() => remove(i)} className="bg-transparent px-2 py-1 text-xs text-text-mid hover:bg-transparent hover:text-mission-failure">
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="bg-void text-xs text-text-mid hover:text-primary">
        + Add another date
      </button>
    </div>
  );
}
