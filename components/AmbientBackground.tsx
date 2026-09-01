const LOG_LINES = [
  "> LINK ESTABLISHED :: RELAY 7-ALPHA",
  "> SCANNING SECTOR GRID 04.19",
  "> PILOT ROSTER SYNC ... OK",
  "> DECRYPTING BRIEFING PACKET 0x3F2A",
  "> NOS COOLANT LEVEL NOMINAL",
  "> UPLINK LATENCY 12MS",
  "> FACTION INTEL FEED :: LIVE",
  "> STRUCTURE INTEGRITY 100%",
  "> AWAITING PILOT AUTHORIZATION",
  "> COMMS CHANNEL 3 OPEN",
  "> NAV BEACON LOCKED",
  "> THREAT ASSESSMENT :: LOW",
  "> CACHING MISSION LOGS",
  "> REACTOR OUTPUT STABLE",
  "> ARCHIVE INDEX REBUILT",
  "> SENSOR SWEEP COMPLETE",
];

function TerminalColumn({ reverse, delay }: { reverse?: boolean; delay: string }) {
  const lines = [...LOG_LINES, ...LOG_LINES];
  return (
    <div className="relative h-full w-56 overflow-hidden opacity-[0.10]">
      <div
        className={`flex flex-col gap-3 whitespace-nowrap font-mono text-[11px] leading-tight text-primary ${
          reverse ? "animate-terminal-scroll-reverse" : "animate-terminal-scroll"
        }`}
        style={{ animationDelay: delay }}
      >
        {lines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    </div>
  );
}

function WireframeGlobe() {
  const rings = [0, 30, 60, 90, 120, 150];
  return (
    <div className="pointer-events-none absolute right-[-80px] top-[-80px] opacity-[0.12] [perspective:800px]">
      <div className="animate-globe-spin h-[420px] w-[420px] [transform-style:preserve-3d]">
        <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-primary" />
          {rings.map((deg) => (
            <ellipse
              key={`lon-${deg}`}
              cx="100"
              cy="100"
              rx={Math.max(4, Math.abs(90 * Math.cos((deg * Math.PI) / 180)))}
              ry="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary"
            />
          ))}
          {[-60, -30, 0, 30, 60].map((lat) => (
            <ellipse
              key={`lat-${lat}`}
              cx="100"
              cy={100 - lat}
              rx={90 * Math.cos((lat * Math.PI) / 180)}
              ry={14}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden">
      <div className="absolute inset-0 flex justify-between px-4">
        <TerminalColumn delay="0s" />
        <TerminalColumn reverse delay="-4s" />
      </div>
      <WireframeGlobe />
    </div>
  );
}
