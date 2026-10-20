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

function TerminalColumn({ reverse, delay, className = "" }: { reverse?: boolean; delay: string; className?: string }) {
  const lines = [...LOG_LINES, ...LOG_LINES];
  return (
    <div className={`relative h-full w-[20rem] overflow-hidden opacity-[0.22] md:w-[26rem] xl:w-[38rem] ${className}`}>
      <div
        className={`flex flex-col gap-6 whitespace-nowrap font-mono text-[15px] font-bold leading-tight text-primary md:text-[20px] xl:text-[28px] ${
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
    <div className="pointer-events-none absolute right-[-18vmin] top-[-10vmin] opacity-[0.32] [perspective:1600px]">
      <div className="animate-globe-spin h-[110vmin] w-[110vmin] max-h-[1100px] max-w-[1100px] [transform-style:preserve-3d] drop-shadow-[0_0_12px_rgba(200,50,50,0.6)]">
        <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-primary" />
          {rings.map((deg) => (
            <ellipse
              key={`lon-${deg}`}
              cx="100"
              cy="100"
              rx={Math.max(4, Math.abs(90 * Math.cos((deg * Math.PI) / 180)))}
              ry="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
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
              strokeWidth="0.9"
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
      <div className="absolute inset-0 flex justify-between px-4 xl:px-8">
        <TerminalColumn delay="0s" />
        <TerminalColumn reverse delay="-4s" className="hidden md:block" />
      </div>
      <WireframeGlobe />
    </div>
  );
}
