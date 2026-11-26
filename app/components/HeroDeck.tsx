"use client";

import { useEffect, useRef, useState } from "react";
import FileHero from "./FileHero";
import { Arrow } from "./FilePieces";

/* Hero (PostGeneric structure): the living file centred in the space above; along the bottom, one baseline with
   the question on the left and the text + buttons on the right. The intro's paper sheet shrinks down onto the
   file's first page (LoadingScreen lands on `data-deck-front`), the folder builds itself around it,
   the two halves of the headline slide in, and the background sheets rise and keep drifting. */

const INTRO_DONE_MS = 4250; // LoadingScreen hands over at ~3.6s and shrinks for ~0.65s

export default function HeroDeck() {
  const [open, setOpen] = useState(false);

  // scroll-out: --p goes 0 → 1 as the hero leaves the screen; sheets fold together, the text lifts and fades,
  // the file shrinks and fades, all gone before the next section arrives
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.75)));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // the tilt: up to 9° toward wherever the cursor is over the file (mouse only, and not for reduced motion)
  const tiltRef = useRef<HTMLDivElement>(null);
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`);
  };
  const untilt = () => {
    tiltRef.current?.style.setProperty("--ry", "0deg");
    tiltRef.current?.style.setProperty("--rx", "0deg");
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setOpen(true), reduce ? 0 : INTRO_DONE_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden px-5 md:px-10" style={{ "--p": 0 } as React.CSSProperties}>
      <Layers />

      <div className="relative mx-auto flex min-h-[calc(100svh-104px)] max-w-[1320px] flex-col pb-12 pt-8 md:pb-16">
        {/* the file, centred in the space above */}
        <div className="flex flex-1 items-center justify-center py-4">
          <div
            className="relative w-[min(81vw,486px,calc((100svh-420px)*0.98))] min-w-[280px] will-change-transform"
            style={{ transform: "scale(calc(1 - var(--p) * 0.42))", opacity: "calc(1 - var(--p) * 1.5)", transformOrigin: "50% 40%" }}
          >
            <div className="relative z-10" onPointerMove={tilt} onPointerLeave={untilt}>
              {/* hover tilt: sets --rx/--ry; FileHero tilts only the folder (and the bundle inside it) with them,
                  the files waiting at the sides stay flat */}
              <div ref={tiltRef}>
                <FileHero intro />
              </div>
            </div>
          </div>
        </div>

        {/* one baseline along the bottom: the question on the left, what it is + the buttons on the right */}
        <div
          className="grid grid-cols-1 items-start gap-8 will-change-transform lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16"
          style={{ transform: "translateY(calc(var(--p) * -140px))", opacity: "calc(1 - var(--p) * 1.9)" }}
        >
          <h1
            className={`hero-word display relative z-20 text-[44px] text-green sm:text-[60px] lg:text-[clamp(42px,4.1vw,66px)] ${open ? "is-in" : ""}`}
            data-side="left"
          >
            <span className="lg:whitespace-nowrap">What&rsquo;s your business</span>
            <br />
            <span className="lg:whitespace-nowrap">
              really worth?
            </span>
          </h1>

          <div className={`hero-word relative z-20 flex max-w-[27rem] flex-col gap-6 lg:justify-self-end lg:pt-2 ${open ? "is-in" : ""}`} data-side="right">
            <p className="text-[17px] leading-[1.6] text-ink/70">
              Answer a few plain questions about your business. Get a valuation range in Naira, with every reason written down.
              No spreadsheets, no finance words, right from your phone.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#estimate" className="btn btn-p btn-lg">
                <Arrow className="h-2.5 w-2.5 text-lime" />
                Get my free estimate
              </a>
              <a href="#how" className="btn btn-s btn-lg">
                See how it works
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* The background: sheets of paper stacked from the bottom, paper to sage, each drifting slowly on its own
   rhythm, so the page always feels like layers in a file. They rise in one by one after the intro. */
function Layers() {
  const sheets = [
    { c: "#eef0e8", h: 36, dur: 14, amp: 10 },
    { c: "#e4eadf", h: 28, dur: 17, amp: 12 },
    { c: "#d8e3d6", h: 20, dur: 13, amp: 9 },
    { c: "#cadbcb", h: 13, dur: 19, amp: 11 },
    { c: "#bcd2bf", h: 7, dur: 15, amp: 8 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-paper">
      {sheets.map((s, i) => (
        // on scroll each sheet folds down toward the lowest one, so they close into a single band
        <span
          key={s.c}
          className="absolute inset-x-0 bottom-0 origin-bottom"
          style={{ height: `${s.h}%`, transform: `scaleY(calc(1 - var(--p) * ${(1 - 7 / s.h).toFixed(3)}))` }}
        >
        <span
          className="hero-sheet absolute inset-x-[-4%] bottom-0 top-0 rounded-t-[48px]"
          style={
            {
              background: s.c,
              boxShadow: "0 -1px 0 rgba(15,27,20,0.05)",
              animationDelay: `${3800 + i * 120}ms, ${4600 + i * 120}ms`,
              "--drift": `${s.amp}px`,
              "--dur": `${s.dur}s`,
            } as React.CSSProperties
          }
        />
        </span>
      ))}
    </div>
  );
}
