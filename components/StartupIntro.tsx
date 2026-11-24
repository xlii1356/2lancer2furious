"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Widescreen video normally, tall video on phones / portrait screens (same rule as the background image).
const VIDEO_LANDSCAPE = "/intro_16x9.webm";
const VIDEO_PORTRAIT = "/intro_9x16.webm";
const SEEN_KEY = "fico-intro-seen";
const FADE_MS = 700; // fade-out time once the video ends or is skipped
const CLICK_GUARD_MS = 600; // ignore clicks this soon after starting, so a double-click doesn't skip

type Phase = "gate" | "playing" | "fading" | "done";

export function StartupIntro() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [src, setSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedAt = useRef(0);

  const finish = useCallback(() => {
    setPhase((p) => (p === "fading" || p === "done" ? p : "fading"));
  }, []);

  const markSeen = () => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked */ }
  };

  const start = useCallback(() => {
    markSeen();
    startedAt.current = Date.now();
    setPhase("playing");
    videoRef.current?.play().catch(() => setPhase("done"));
  }, []);

  // Decide whether to show it at all: once per browser session, for everyone.
  useEffect(() => {
    setSrc(window.matchMedia("(max-aspect-ratio: 1/1)").matches ? VIDEO_PORTRAIT : VIDEO_LANDSCAPE);
    try {
      if (sessionStorage.getItem(SEEN_KEY) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPhase("done");
      }
    } catch { /* storage blocked: just show it */ }
  }, []);

  // After the fade-out, remove the overlay.
  useEffect(() => {
    if (phase !== "fading") return;
    const t = setTimeout(() => setPhase("done"), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Stop the page behind from scrolling while the overlay is up.
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [phase]);

  // Keyboard: Enter/Space to initialize, Escape to skip.
  useEffect(() => {
    if (phase === "done" || phase === "fading") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { markSeen(); finish(); }
      else if ((e.key === "Enter" || e.key === " ") && phase === "gate") { e.preventDefault(); start(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, start, finish]);

  const onActivate = () => {
    if (phase === "gate") start();
    else if (phase === "playing" && Date.now() - startedAt.current > CLICK_GUARD_MS) finish();
  };

  if (phase === "done") return null;

  return (
    <>
      <div
        id="startup-intro"
        suppressHydrationWarning
        role="button"
        aria-label={phase === "gate" ? "Click to initialize" : "Click to skip intro"}
        onClick={onActivate}
        className={`fixed inset-0 z-[100] flex cursor-pointer select-none items-center justify-center bg-black transition-opacity ${
          phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        {/* Loads in the background while the gate is showing. If the file is missing, the intro is skipped. */}
        {src && (
        <video
          ref={videoRef}
          src={src}
          preload="auto"
          playsInline
          disablePictureInPicture
          onEnded={finish}
          onError={() => setPhase("done")}
          className={`absolute inset-0 h-full w-full object-contain ${phase === "gate" ? "opacity-0" : "opacity-100"}`}
        />
        )}
        {phase === "gate" && (
          <div className="relative flex flex-col items-center gap-6 text-center">
            <img src="/FiCo_Corps_Crest.webp" alt="" className="h-28 w-28 object-contain" />
            <div className="font-mono text-sm uppercase tracking-[0.3em] text-text-mid">Union Intelligence Bureau</div>
            <div className="font-mono text-lg font-bold uppercase tracking-[0.25em] text-primary">
              &gt; Click to initialize<span className="animate-terminal-blink">_</span>
            </div>
          </div>
        )}
      </div>
      {/* Runs while the page is still loading, so a returning session never flashes the overlay. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${SEEN_KEY}")){var o=document.getElementById("startup-intro");if(o)o.style.display="none"}}catch(e){}`,
        }}
      />
    </>
  );
}
