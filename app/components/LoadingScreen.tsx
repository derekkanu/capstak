"use client";

import { useEffect, useState } from "react";

const C_FADE_MS = 350;
const K_DELAY_MS = 250;
const K_FADE_MS = 350;
const ARROW_DELAY_MS = 250;
const ARROW_CYCLE_MS = 800;
const ARROW_CYCLES = 3;
const FADE_OUT_MS = 650;

const ARROW_TOTAL = ARROW_CYCLE_MS * ARROW_CYCLES;
const SEQUENCE_TOTAL = C_FADE_MS + K_DELAY_MS + K_FADE_MS + ARROW_DELAY_MS + ARROW_TOTAL;

/**
 * The logo intro. When it ends, the logo fades and the paper it sits on dissolves away (no box, no
 * movement), so you just see the hero assemble underneath: the documents drifting in, the folder building.
 */
export default function LoadingScreen() {
  const [phase, setPhase] = useState<"intro" | "lift" | "fade">("intro");
  const [hidden, setHidden] = useState(false);

  // a reload always starts at the hero: the browser would otherwise restore the old scroll position, and a
  // #section left in the address by the nav links would jump there. Clear both.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    // no box, no shrink: the logo fades, then the paper dissolves away while the hero assembles underneath
    timers.push(
      window.setTimeout(() => {
        setPhase("fade");
        timers.push(window.setTimeout(() => setHidden(true), FADE_OUT_MS + 50));
      }, SEQUENCE_TOTAL),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  if (hidden) return null;

  const arrowDelayMs = C_FADE_MS + K_DELAY_MS + K_FADE_MS + ARROW_DELAY_MS;
  const leaving = phase !== "intro";

  return (
    <div
      aria-hidden={leaving}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-paper ${leaving ? "pointer-events-none" : ""} ${
        phase === "lift" ? "loader-lift" : ""
      }`}
      style={{ opacity: phase === "fade" ? 0 : 1, transition: `opacity ${FADE_OUT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
    >
      <div
        className="relative aspect-[1614/992] w-[130px] transition-opacity duration-200 md:w-[170px]"
        style={{ opacity: leaving ? 0 : 1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-c-only.png" alt="Capstack" draggable={false} className="capstack-fade-c absolute inset-0 h-full w-full select-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-k-only.png" alt="" draggable={false} className="capstack-fade-k absolute inset-0 h-full w-full select-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-arrow.png"
          alt=""
          draggable={false}
          className="capstack-arrow-grow absolute inset-0 h-full w-full select-none"
          style={{ animationDelay: `${arrowDelayMs}ms` }}
        />
      </div>
    </div>
  );
}
