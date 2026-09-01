"use client";
import { useState } from "react";

export function SplitPortrait({ pilotSrc, mechSrc }: { pilotSrc: string; mechSrc: string }) {
  const [side, setSide] = useState<"pilot" | "mech" | null>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const thresholdY = rect.height - (rect.height / rect.width) * x;
    setSide(y < thresholdY ? "pilot" : "mech");
  }

  const clip =
    side === "pilot"
      ? "polygon(0 0, 200% 0, 0 200%, 0 100%)"
      : side === "mech"
        ? "polygon(0 0, 0 0, 0 0, 0 0)"
        : "polygon(0 0, 100% 0, 0 100%, 0 100%)";

  return (
    <div
      className="relative h-[280px] w-[200px] shrink-0 overflow-hidden border border-separator bg-void"
      onMouseMove={handleMove}
      onMouseLeave={() => setSide(null)}
    >
      <div className="absolute inset-0">
        <img src={mechSrc} alt="Active frame" className="h-full w-full object-contain" />
        <div className="absolute bottom-0 right-0 bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">ACTIVE FRAME</div>
      </div>
      <div className="absolute inset-0 bg-void transition-[clip-path] duration-300" style={{ clipPath: clip }}>
        <img src={pilotSrc} alt="Pilot" className="h-full w-full object-contain" />
        <div className="absolute left-0 top-0 bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">PILOT VISUAL</div>
      </div>
    </div>
  );
}
