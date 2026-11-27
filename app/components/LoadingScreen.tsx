"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ARROW, ARROW_FILL, INK, LETTERS } from "../lib/logoIntroData";
import { END_MS, FPS, INTRO_MS, PEN_WIDTH, SHEETS, VIEWBOX, introState } from "../lib/logoIntro";

const PAPER_FADE_MS = 1000; // the paper dissolves while the Ck is still scaling out
const STILL_FRAME = 134; // reduced motion: the written word with its arrow, held still

const penPath = (points: string) => "M" + points.split(" ").join(" L");

/**
 * The logo intro: the pen writes "Capstack" with the homepage's sage sheets running ahead of the ink, the arrow
 * drifts in, then the C and the arrow squeeze the word down to the Ck mark, which scales out and fades while the
 * paper dissolves and the hero assembles underneath. Drawn as SVG from the same shapes and timeline as the Cavalry scene.
 */
/** The intro plays on the home page only; the product (/start, /app) opens straight away. */
export default function LoadingScreen() {
  return usePathname() === "/" ? <Intro /> : null;
}

function Intro() {
  const [frame, setFrame] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);
  const uid = useId().replace(/:/g, "");

  // a reload always starts at the hero: the browser would otherwise restore the old scroll position, and a
  // #section left in the address by the nav links would jump there. Clear both.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let raf = 0;
    if (reduce) {
      raf = requestAnimationFrame(() => setFrame(STILL_FRAME));
    } else {
      const start = performance.now();
      const tick = (now: number) => {
        const f = ((now - start) / 1000) * FPS;
        setFrame(f);
        if (now - start < END_MS) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    const handoff = reduce ? 900 : INTRO_MS;
    timers.push(window.setTimeout(() => setLeaving(true), handoff));
    timers.push(window.setTimeout(() => setHidden(true), Math.max(reduce ? 0 : END_MS, handoff + PAPER_FADE_MS) + 50));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (hidden) return null;

  const s = introState(frame);
  const { x, y, w, h } = VIEWBOX;
  const ax = (ARROW.box[0] + ARROW.box[2]) / 2;
  const ay = (ARROW.box[1] + ARROW.box[3]) / 2;
  // the letters the C and k squeeze sit underneath them
  const squeezer = (n: string) => n === "C" || n === "k";
  const order = LETTERS.map((L, i) => ({ L, i })).sort((p, q) => Number(squeezer(p.L.name)) - Number(squeezer(q.L.name)));

  return (
    <div
      aria-hidden={leaving}
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${leaving ? "pointer-events-none" : ""}`}
    >
      {/* the paper, on its own so it can dissolve while the logo is still leaving */}
      <div
        className="absolute inset-0 bg-paper"
        style={{ opacity: leaving ? 0 : 1, transition: `opacity ${PAPER_FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
      />
      <svg
        viewBox={`${x} ${y} ${w} ${h}`}
        className="relative w-[min(38.5vw,334px)] overflow-visible"
        style={{ opacity: s.logo.opacity }}
        role="img"
        aria-label="Capstack"
      >
        <defs>
          {order.map(({ L, i }) =>
            s.letters[i].layers.map((strokes, layer) => (
              <mask key={`${i}-${layer}`} id={`${uid}-${i}-${layer}`} maskUnits="userSpaceOnUse" x={x - w} y={y - h} width={w * 3} height={h * 3}>
                {L.pens.map((pen, j) => (
                  <path
                    key={j}
                    d={penPath(pen)}
                    pathLength={1}
                    fill="none"
                    stroke="white"
                    strokeWidth={PEN_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${strokes[j]} 2`}
                    // a zero-length dash still draws its round cap, so hide strokes the pen hasn't reached
                    opacity={strokes[j] > 0 ? 1 : 0}
                  />
                ))}
              </mask>
            )),
          )}
        </defs>
        <g transform={`translate(${s.logo.cx} ${s.logo.cy + s.logo.dy}) scale(${s.logo.scale}) translate(${-s.logo.cx} ${-s.logo.cy})`}>
          {order.map(({ L, i }) => {
            const st = s.letters[i];
            if (st.opacity <= 0) return null;
            return (
              <g key={L.name} transform={`translate(${st.dx} 0)`} opacity={st.opacity}>
                {[...SHEETS, INK].map((colour, layer) => (
                  <path
                    key={layer}
                    d={L.d}
                    fill={colour}
                    // the traced outlines and their counters wind the same way, so even-odd keeps the holes open
                    fillRule="evenodd"
                    mask={`url(#${uid}-${i}-${layer})`}
                    opacity={layer < SHEETS.length ? st.sheetOpacity : 1}
                  />
                ))}
              </g>
            );
          })}
          <g
            opacity={s.arrow.opacity}
            transform={`translate(${ax + s.arrow.dx} ${ay + s.arrow.dy}) scale(${s.arrow.scale}) translate(${-ax} ${-ay})`}
          >
            <path d={ARROW.d} fill={ARROW_FILL} fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}
