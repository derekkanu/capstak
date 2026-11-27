"use client";

import { useEffect, useRef, useState } from "react";

/* How it works, as a bookshelf. The four steps are folders leaning on each other on one shelf; the one
   you point at (or the next one, every few seconds) slides up and stands straight, its neighbours lean
   away, and its story shows on the left. A few plain binders fill the shelf around them. */

type Book = { n: string; title: React.ReactNode; body: string; bg: string; fg: string; h: number; ring?: boolean };

const STEPS: Book[] = [
  {
    n: "01",
    title: <>Tell us what you do</>,
    body: "Three minutes, one easy question at a time: what you sell, where you are, how long you've been at it. All you need to start is your phone number.",
    bg: "#fbfaf6",
    fg: "#042e1b",
    h: 340,
    ring: true,
  },
  {
    n: "02",
    title: <>Add your sales and costs</>,
    body: "In your own time. Rough guesses are fine, and you can skip anything and come back. Got bank statements or POS slips? Add them and the result gets sharper.",
    bg: "#93b99b",
    fg: "#042e1b",
    h: 372,
  },
  {
    n: "03",
    title: <>See what it{"'"}s worth</>,
    body: "Once there's enough to go on, we work it out: a low-to-high range in Naira, how sure we are, and every reason, in plain words.",
    bg: "#042e1b",
    fg: "#f7f5ef",
    h: 356,
  },
  {
    n: "04",
    title: <>Use it your way</>,
    body: "Show it to a buyer, a bank or a partner. Or keep it to yourself, and walk into any conversation knowing what you've built.",
    bg: "#cfc8c0",
    fg: "#042e1b",
    h: 330,
  },
];

// plain binders that fill the shelf (no story of their own)
const FILLERS_LEFT = [
  { bg: "#e8e7df", h: 300, w: 38 },
  { bg: "#c9dccb", h: 318, w: 54 },
];
const FILLERS_RIGHT = [
  { bg: "#0b3f25", h: 312, w: 46 },
  { bg: "#e8e7df", h: 290, w: 36 },
];

export default function Shelf({ head }: { head?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const timer = useRef<number | null>(null);

  // walk along the shelf by itself until someone points at a book
  useEffect(() => {
    if (held) return;
    timer.current = window.setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3400);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [held]);

  // the hero's step pills open a step here
  useEffect(() => {
    const go = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      if (typeof i === "number") {
        setHeld(true);
        setActive(i);
      }
    };
    window.addEventListener("capstack:step", go);
    return () => window.removeEventListener("capstack:step", go);
  }, []);

  const s = STEPS[active];

  return (
    <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
      {/* one heading for the section; under it, the step whose book is out (a smaller title, so it reads as part of it) */}
      <div className="flex flex-col justify-between gap-10 lg:pb-10">
        {head}
        <div key={active} className="playground-in flex min-h-[190px] flex-col gap-3 border-t border-ink/15 pt-6">
          <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-green md:text-[28px]">{s.title}</h3>
          <p className="max-w-[40ch] text-[17px] leading-[1.6] text-ink/65">{s.body}</p>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {STEPS.map((b, i) => (
              <span key={b.n} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-10 bg-green" : "w-4 bg-ink/15"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* the shelf */}
      <div className="relative mx-auto w-full max-w-[560px] overflow-x-clip lg:mx-0" onMouseLeave={() => setHeld(false)}>
        <div className="flex h-[420px] items-end justify-center px-4">
          {FILLERS_LEFT.map((f, i) => (
            <span
              key={`l${i}`}
              aria-hidden
              className="block shrink-0 rounded-[5px_5px_2px_2px] transition-transform duration-500"
              style={{ background: f.bg, height: f.h, width: f.w, transform: `rotate(${-3 - i}deg)`, transformOrigin: "bottom right" }}
            />
          ))}
          {STEPS.map((b, i) => {
            const on = i === active;
            const lean = on ? 0 : i < active ? -7 : 7;
            return (
              <button
                key={b.n}
                type="button"
                aria-pressed={on}
                aria-label={`Step ${b.n}`}
                onMouseEnter={() => {
                  setHeld(true);
                  setActive(i);
                }}
                onFocus={() => {
                  setHeld(true);
                  setActive(i);
                }}
                onClick={() => setActive(i)}
                className={`relative flex shrink-0 flex-col items-center justify-between rounded-[6px_6px_3px_3px] py-4 transition-[transform,box-shadow,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  b.ring ? "ring-1 ring-ink/70" : ""
                } ${on ? "z-[2] w-[96px] shadow-[0_24px_40px_-24px_rgba(0,0,0,0.6)]" : "w-[78px]"}`}
                style={{
                  background: b.bg,
                  color: b.fg,
                  height: b.h,
                  transform: `translateY(${on ? -26 : 0}px) rotate(${lean}deg)`,
                  transformOrigin: i < active ? "bottom right" : "bottom left",
                }}
              >
                <span className="font-mono text-[12px] font-medium">{b.n}</span>
                <span className="rotate-180 whitespace-nowrap text-[22px] font-medium tracking-[-0.02em] [writing-mode:vertical-rl] [&_em]:font-normal">
                  {b.title}
                </span>
              </button>
            );
          })}
          {FILLERS_RIGHT.map((f, i) => (
            <span
              key={`r${i}`}
              aria-hidden
              className="block shrink-0 rounded-[5px_5px_2px_2px]"
              style={{ background: f.bg, height: f.h, width: f.w, transform: `rotate(${4 + i * 2}deg)`, transformOrigin: "bottom left" }}
            />
          ))}
        </div>
        {/* the shelf board */}
        <div className="h-3 rounded-[2px] bg-green" />
        <div className="mx-3 h-2 rounded-b-[3px] bg-green/60" />
      </div>
    </div>
  );
}
