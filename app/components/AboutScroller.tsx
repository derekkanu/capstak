"use client";

import { useEffect, useRef, useState } from "react";

type Panel = {
  key: string;
  eyebrow: string;
  eyebrowNote?: string;
  Icon: () => React.ReactElement;
  bg: string;
  headline: string;
  sub: string | string[];
  visualSide: "left" | "right";
  Visual: () => React.ReactElement;
};

// Each panel mirrors one of the reference designs: its own card colour,
// serif-italic eyebrow, headline, supporting copy and a side visual.
const PANELS: Panel[] = [
  {
    key: "about",
    eyebrow: "About Capstack",
    Icon: AboutIcon,
    bg: "#34c759",
    headline: "Capstack is a guided business valuation platform.",
    sub: [
      "It’s designed to make understanding your company’s value effortless and accessible.",
      "We believe every business owner should have a clear grasp of their worth. Capstack uses conversational AI to guide you step-by-step, removing the complexity from business valuation.",
    ],
    visualSide: "left",
    Visual: AboutVisual,
  },
  {
    key: "collect",
    eyebrow: "Seamless Data Collection",
    Icon: CollectIcon,
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
    Icon: AiIcon,
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
    Icon: ReportIcon,
    bg: "#d3e88a",
    headline: "Receive beautifully designed reports tailored to your business’s story.",
    sub: "After your valuation, download a personalized report filled with clear visuals and insights. It’s designed to make complex data easy to understand and share with investors or partners.",
    visualSide: "right",
    Visual: ReportVisual,
  },
];

// How small the card starts before it grows into full width on reveal.
// A more pronounced shrink so the grow-in is clearly visible.
const MIN_SCALE = 0.85;

export default function AboutScroller() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

      // Entry "grow" effect: while the section rises into the pinned position
      // (rect.top travels from one viewport height down to 0) the card scales
      // up from slightly smaller to full size, so it grows to fill the space
      // as it is revealed. Once pinned (rect.top <= 0) it stays at full scale.
      const vh = window.innerHeight || 1;
      const reveal = Math.min(1, Math.max(0, (vh - rect.top) / vh));
      const scale = MIN_SCALE + (1 - MIN_SCALE) * reveal;
      if (cardRef.current) {
        cardRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }
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
          ref={cardRef}
          className="relative mx-auto h-[calc(100svh-2rem)] w-full max-w-[1400px] overflow-hidden rounded-[28px] md:rounded-[32px]"
          style={{
            // The whole card recolours to the active panel as you scroll.
            background: PANELS[active].bg,
            transition: "background 1000ms ease",
            // Starts slightly smaller and grows to full scale on reveal
            // (driven imperatively from the scroll handler).
            transform: `scale(${MIN_SCALE})`,
            transformOrigin: "center",
            willChange: "transform",
          }}
        >
          {PANELS.map((p, i) => {
            const on = i === active;
            // Three roles drive the motion:
            //  - outgoing (already passed): lift up a few px, then fade. The
            //    opacity fade is delayed so the panel visibly rises before it
            //    disappears.
            //  - incoming (still ahead): wait below and rise into position while
            //    fading in, so it animates into place rather than popping in.
            const role = i === active ? "active" : i < active ? "out" : "in";
            const offset = role === "active" ? 0 : role === "out" ? -8 : 18;
            const transition =
              role === "out"
                ? "transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 520ms ease 150ms"
                : "transform 850ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease";
            return (
              <div
                key={p.key}
                aria-hidden={!on}
                className="absolute inset-0"
                style={{
                  opacity: on ? 1 : 0,
                  transform: `translateY(${offset}px)`,
                  transition,
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
  const { eyebrow, eyebrowNote, Icon, headline, sub, visualSide, Visual } = panel;
  return (
    <div className="flex h-full flex-col justify-center px-6 py-8 md:px-12 md:py-14 lg:px-16">
      <div className="grid flex-1 grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-14">
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
            <Icon />
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
          {(Array.isArray(sub) ? sub : [sub]).map((para, i) => (
            <p
              key={i}
              className="mt-6 max-w-[440px] text-[13px] leading-[1.65] text-green/70 md:text-[15px]"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Eyebrow icons ---------------- */
// Each section's eyebrow icon, coloured to match the reference designs.

// About: pale-lime north-west arrow.
function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="#cfe98f" aria-hidden>
      <path d="M5 5v10h2V8.41L18.59 20 20 18.59 8.41 7H15V5z" />
    </svg>
  );
}

// Seamless Data Collection: cream bookmark with a plus.
function CollectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="#f5efd9" aria-hidden>
      <path d="M7 2h10a2 2 0 0 1 2 2v17l-7-3.2L5 21V4a2 2 0 0 1 2-2zm6 5h-2v2H9v2h2v2h2v-2h2V9h-2V7z" />
    </svg>
  );
}

// AI-Powered Valuation: white robot head.
function AiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="#ffffff" aria-hidden>
      <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z" />
    </svg>
  );
}

// Report Personalization: green badge with a pale trending-up bar chart.
function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#5cbf7a" />
      <path
        d="M7 16.6v-2.7M12 16.6v-4.7M17 16.6v-6.6"
        stroke="#edf7cc"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M6.8 12.3 11.4 8.9l2.4 1.4 4.4-3.2"
        fill="none"
        stroke="#edf7cc"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.1 7.1h3.1v3"
        fill="none"
        stroke="#edf7cc"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- Visuals ---------------- */

// Each section's visual is a finished design render, shown as a rounded card.
function ImageVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[361/440] w-full max-w-[250px] overflow-hidden rounded-[28px] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] md:max-w-[400px] lg:max-w-[440px]">
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

// About: branded Capstack cube.
function AboutVisual() {
  return <ImageVisual src="/about-card.png" alt="Capstack branded cube sign" />;
}

// Seamless Data Collection: conversational-AI chat on a laptop.
function ChatVisual() {
  return <ImageVisual src="/about-chat.png" alt="Capstack chat interface on a laptop" />;
}

// AI-Powered Valuation: business owner using Capstack.
function AiVisual() {
  return <ImageVisual src="/about-ai.png" alt="Business owner using Capstack" />;
}

// Report Personalization: personalized valuation report.
function ReportVisual() {
  return <ImageVisual src="/about-report.png" alt="Personalized Capstack valuation report" />;
}
