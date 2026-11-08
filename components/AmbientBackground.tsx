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

function CrestBackdrop() {
  return (
    <div className="pointer-events-none absolute right-[-18vmin] top-[-10vmin] opacity-[0.32] drop-shadow-[0_0_12px_rgba(200,50,50,0.6)]">
      <img
        src="/FiCo_Corps_Crest_Outlines.webp"
        alt=""
        className="h-[110vmin] w-[110vmin] max-h-[1100px] max-w-[1100px] object-contain"
      />
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
      <CrestBackdrop />
    </div>
  );
}
