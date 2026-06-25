"use client";

import { useEffect, useRef, useState } from "react";

type Panel = {
  key: string;
  eyebrow: string;
  eyebrowNote?: string;
  eyebrowIcon: string;
  bg: string;
  headline: string;
  sub: string;
  visualSide: "left" | "right";
  Visual: () => React.ReactElement;
};

// Each panel mirrors one of the reference designs: its own card colour,
// serif-italic eyebrow, headline, supporting copy and a side visual.
const PANELS: Panel[] = [
  {
    key: "about",
    eyebrow: "About Capstack",
    eyebrowIcon: "/about-receipt.png",
    bg: "#34c759",
    headline:
      "Capstack is a guided business valuation platform designed to make understanding your company’s value effortless and accessible.",
    sub: "We believe every business owner should have a clear grasp of their worth. Capstack uses conversational AI to guide you step-by-step, removing the complexity from business valuation.",
    visualSide: "left",
    Visual: AboutVisual,
  },
  {
    key: "collect",
    eyebrow: "Seamless Data Collection",
    eyebrowIcon: "/about-collect.png",
    bg: "#edb4e6",
    headline:
      "Answer simple, everyday questions, and let Capstack gather the data effortlessly.",
    sub: "As you respond in plain words, our AI captures key financial and operational details. The chat-based flow ensures you don’t miss a crucial insight, all while staying in a natural conversation.",
    visualSide: "right",
    Visual: ChatVisual,
  },
  {
    key: "ai",
    eyebrow: "AI-Powered Valuation",
    eyebrowNote: "(Coming Soon)",
    eyebrowIcon: "/about-robot.png",
    bg: "#a7efce",
    headline:
      "Unlock advanced AI that elevates your valuation with deep data analysis and comparisons.",
    sub: "Coming soon in our Pro subscription, AI will harness both quantitative data and comparative benchmarks, giving you a precise, investor-ready valuation.",
    visualSide: "left",
    Visual: AiVisual,
  },
  {
    key: "report",
    eyebrow: "Report Personalization",
    eyebrowIcon: "/about-chart.png",
    bg: "#d3e88a",
    headline: "Receive beautifully designed reports tailored to your business’s story.",
    sub: "After your valuation, download a personalized report filled with clear visuals and insights. It’s designed to make complex data easy to understand and share with investors or partners.",
    visualSide: "right",
    Visual: ReportVisual,
  },
];

export default function AboutScroller() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0); // index of the visible panel
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(travel, 1));
      const p = travel > 0 ? scrolled / travel : 0;
      // Discrete bands: scroll crosses a boundary -> snap to the next panel.
      const idx = Math.min(PANELS.length - 1, Math.max(0, Math.floor(p * PANELS.length)));
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Reduced-motion / no-JS fallback: stack the panels normally.
  if (reduced) {
    return (
      <section id="about" className="px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
          {PANELS.map((p) => (
            <div
              key={p.key}
              className="rounded-[28px] md:rounded-[32px]"
              style={{ background: p.bg }}
            >
              <PanelContent panel={p} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="about"
      ref={wrapRef}
      className="relative"
      style={{ height: `${PANELS.length * 100}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center px-4 md:px-6">
        <div
          className="relative mx-auto h-[calc(100svh-2rem)] w-full max-w-[1400px] overflow-hidden rounded-[28px] md:rounded-[32px]"
          style={{
            // The whole card recolours to the active panel as you scroll.
            background: PANELS[active].bg,
            transition: "background 1000ms ease",
          }}
        >
          {PANELS.map((p, i) => {
            const on = i === active;
            return (
              <div
                key={p.key}
                aria-hidden={!on}
                className="absolute inset-0"
                style={{
                  // Snap-switch: the active panel animates 0 -> 100% quickly
                  // when scroll crosses into its band, instead of fading
                  // gradually with scroll position.
                  opacity: on ? 1 : 0,
                  transform: on ? "translateY(0)" : "translateY(14px)",
                  transition: "opacity 1000ms ease, transform 1000ms ease",
                  pointerEvents: on ? "auto" : "none",
                  willChange: "opacity, transform",
                }}
              >
                <PanelContent panel={p} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PanelContent({ panel }: { panel: Panel }) {
  const { eyebrow, eyebrowNote, eyebrowIcon, headline, sub, visualSide, Visual } = panel;
  return (
    <div className="flex h-full flex-col justify-center px-6 py-10 md:px-12 md:py-14 lg:px-16">
      <div className="grid flex-1 grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* Visual */}
        <div
          className={`flex justify-center ${
            visualSide === "left" ? "md:order-1" : "md:order-2"
          }`}
        >
          <Visual />
        </div>

        {/* Copy */}
        <div
          className={`max-w-[520px] text-green ${
            visualSide === "left" ? "md:order-2" : "md:order-1"
          }`}
        >
          <p className="flex items-center gap-2 text-[20px] text-green md:text-[24px]">
            <img src={eyebrowIcon} alt="" className="h-5 w-5 md:h-6 md:w-6" draggable={false} />
            <span className="serif-italic">{eyebrow}</span>
            {eyebrowNote ? (
              <span className="serif-italic text-[15px] text-green/70 md:text-[17px]">
                {eyebrowNote}
              </span>
            ) : null}
          </p>
          <h2 className="mt-6 text-[26px] font-medium leading-[1.18] tracking-[-0.01em] md:text-[34px] lg:text-[40px]">
            {headline}
          </h2>
          <p className="mt-6 max-w-[440px] text-[13px] leading-[1.65] text-green/70 md:text-[15px]">
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Visuals ---------------- */

// About: branded card with the Capstack wordmark and arrow badge.
function AboutVisual() {
  return (
    <div className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[28px] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 30% 15%, #163a23, #0a1d12)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="serif-italic text-[72px] leading-none text-white">CR</span>
      </div>
      <div
        className="absolute bottom-5 right-5 flex h-16 w-16 items-center justify-center rounded-[18px]"
        style={{ background: "#34c759" }}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="M7 17 17 7M9 7h8v8"
            stroke="#0a1d12"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Seamless Data Collection: conversational-AI chat mockup.
function ChatVisual() {
  return (
    <div className="w-full max-w-[420px] space-y-4">
      <Bubble role="in">
        We believe every business owner should have a clear grasp of their worth. Capstack uses
        conversational AI to guide you step-by-step, removing the complexity from business
        valuation.
      </Bubble>
      <Bubble role="out">Capstack uses conversational.</Bubble>
      <Bubble role="in">
        Business owner should have a clear grasp of their worth. Capstack uses conversational.
      </Bubble>
      <Bubble role="out">AI to guide you step</Bubble>
    </div>
  );
}

function Bubble({ role, children }: { role: "in" | "out"; children: React.ReactNode }) {
  if (role === "out") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-2xl bg-green-deep px-4 py-3 text-[13px] text-lime">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[90%] rounded-2xl bg-white px-4 py-3 text-[13px] leading-[1.55] text-green shadow-[0_10px_30px_-18px_rgba(0,0,0,0.4)]">
      {children}
    </div>
  );
}

// AI-Powered Valuation: dark illustration on a soft white blob.
function AiVisual() {
  return (
    <div className="relative grid place-items-center">
      <div
        className="h-[260px] w-[260px] bg-white md:h-[300px] md:w-[300px]"
        style={{ borderRadius: "46% 54% 43% 57% / 55% 44% 56% 45%" }}
      />
      <img
        src="/about-robot.png"
        alt=""
        draggable={false}
        className="absolute h-[120px] w-auto md:h-[150px]"
      />
    </div>
  );
}

// Report Personalization: tilted personalized-report mockup.
function ReportVisual() {
  return (
    <div className="relative w-full max-w-[340px]">
      <div className="absolute inset-x-6 top-2 h-40 rotate-[6deg] rounded-2xl bg-green-mid" />
      <div className="relative -rotate-[7deg] rounded-2xl bg-white p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-green" />
          <div className="h-2.5 w-28 rounded bg-green/70" />
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="h-1.5 w-full rounded bg-green/15" />
          <div className="h-1.5 w-5/6 rounded bg-green/15" />
          <div className="h-1.5 w-2/3 rounded bg-green/15" />
        </div>
        <div className="mt-5 text-[12px] font-semibold tracking-tight text-green">
          NGN 553,400,000
        </div>
        <div className="mt-3 flex h-20 items-end gap-3">
          <div className="w-1/2 rounded-t-md bg-lime" style={{ height: "55%" }} />
          <div className="w-1/2 rounded-t-md bg-green" style={{ height: "92%" }} />
        </div>
      </div>
    </div>
  );
}
