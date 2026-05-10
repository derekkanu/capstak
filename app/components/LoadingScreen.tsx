"use client";

import { useEffect, useState } from "react";

const C_FADE_MS = 350;
const K_DELAY_MS = 250;
const K_FADE_MS = 350;
const ARROW_DELAY_MS = 250;
const ARROW_CYCLE_MS = 800;
const ARROW_CYCLES = 3;
const FADE_OUT_MS = 500;

const ARROW_TOTAL = ARROW_CYCLE_MS * ARROW_CYCLES;
const SEQUENCE_TOTAL =
  C_FADE_MS + K_DELAY_MS + K_FADE_MS + ARROW_DELAY_MS + ARROW_TOTAL;

export default function LoadingScreen() {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const startFade = window.setTimeout(() => setFading(true), SEQUENCE_TOTAL);
    const remove = window.setTimeout(
      () => setHidden(true),
      SEQUENCE_TOTAL + FADE_OUT_MS,
    );
    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(remove);
    };
  }, []);

  if (hidden) return null;

  const arrowDelayMs =
    C_FADE_MS + K_DELAY_MS + K_FADE_MS + ARROW_DELAY_MS;

  return (
    <div
      aria-hidden={fading}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        transitionProperty: "opacity",
        transitionDuration: `${FADE_OUT_MS}ms`,
      }}
    >
      <div className="relative aspect-[1614/992] w-[130px] md:w-[170px]">
        <img
          src="/icon-c-only.png"
          alt="Capstack"
          draggable={false}
          className="capstack-fade-c absolute inset-0 h-full w-full select-none"
        />
        <img
          src="/icon-k-only.png"
          alt=""
          draggable={false}
          className="capstack-fade-k absolute inset-0 h-full w-full select-none"
        />
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
