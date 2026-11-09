"use client";

import { useEffect, useRef, useState } from "react";

const LOG_LINES = [
  "> LINK ESTABLISHED :: RELAY 7-ALPHA",
  "> SCANNING SECTOR GRID 04.19",
  "> PILOT ROSTER SYNC ... OK",
  "> DECRYPTING BRIEFING PACKET 0x3F2A",
  "> PROCESSING TAU-CETI DEPENDANCY",
  "> UPLINK LATENCY 12MS",
  "> FACTION INTEL FEED :: LIVE",
  "> STRUCTURE INTEGRITY 100%",
  "> XOVERON PROTOCOL :: RUINED",
  "> COMMS CHANNEL 3 OPEN",
  "> NAV BEACON LOCKED",
  "> THREAT ASSESSMENT :: UNKNOWN",
  "> CACHING MISSION LOGS",
  "> REACTOR OUTPUT STABLE",
  "> ARCHIVE INDEX REBUILT",
  "> SENSOR SWEEP COMPLETE",
];

const TYPE_MS = 28; // base delay between characters
const TYPE_JITTER_MS = 22; // random extra delay per character
const LINE_PAUSE_MS = 450; // pause after a line is finished
const MAX_LINES = 80; // finished lines kept in memory

function TerminalColumn() {
  const [lines, setLines] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let lineIndex = 0;
    let charCount = 0;

    const tick = () => {
      if (cancelled) return;
      const line = LOG_LINES[lineIndex % LOG_LINES.length];
      if (charCount < line.length) {
        charCount++;
        setTyping(line.slice(0, charCount));
        timer = setTimeout(tick, TYPE_MS + Math.random() * TYPE_JITTER_MS);
      } else {
        setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), line]);
        setTyping("");
        lineIndex++;
        charCount = 0;
        timer = setTimeout(tick, LINE_PAUSE_MS);
      }
    };

    timer = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Keep the newest line in view; once the column is full, older lines scroll off the top.
  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  return (
    <div
      ref={boxRef}
      className="relative h-full w-[20rem] overflow-hidden opacity-[0.22] md:w-[26rem] xl:w-[38rem]"
    >
      <div className="flex flex-col gap-6 whitespace-nowrap py-4 font-mono text-[15px] font-bold leading-tight text-primary md:text-[20px] xl:text-[28px]">
        {lines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
        <span>
          {typing}
          <span className="animate-terminal-blink">▌</span>
        </span>
      </div>
    </div>
  );
}

function CrestBackdrop() {
  return (
    <div className="pointer-events-none absolute right-[-18vmin] top-[-10vmin] opacity-[0.32] [perspective:1600px]">
      <div className="animate-globe-spin h-[110vmin] w-[110vmin] max-h-[1100px] max-w-[1100px] [transform-style:preserve-3d] drop-shadow-[0_0_12px_rgba(200,50,50,0.6)]">
        <img src="/FiCo_Corps_Crest_Outlines.webp" alt="" className="animate-crest-flip h-full w-full object-contain" />
      </div>
    </div>
  );
}

export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden">
      <div className="absolute inset-0 flex px-4 md:pl-[106px] xl:pl-[122px]">
        <TerminalColumn />
      </div>
      <CrestBackdrop />
    </div>
  );
}
