"use client";

import { useEffect, useRef, useState } from "react";

const CARD_GREEN = "#34c759";

const BODY = (
  <>
    <p>
      In the world of entrepreneurship and investment, understanding your
      business&rsquo;s true value is crucial. Yet, the current valuation
      processes can be cumbersome, complex, and intimidating for business
      owners, investors, and brokers alike.
    </p>
    <p>
      At Capstack, we&rsquo;re on a mission to transform this experience. We
      believe that getting a business valuation should be straightforward,
      transparent, and accessible to everyone. Our platform is designed to
      simplify the process, ensuring accuracy and ease, and making it the go-to
      destination for all your valuation needs. With Capstack, you can
      confidently navigate the complexities of business valuation and focus on
      what truly matters: growing your business.
    </p>
  </>
);

const PANELS: { title: string; Icon: () => React.ReactElement }[] = [
  { title: "About Capstack.", Icon: ReceiptIcon },
  { title: "Seamless data collection", Icon: CollectIcon },
  { title: "AI powered valuation", Icon: RobotIcon },
  { title: "Report personalization", Icon: ChartIcon },
];

export default function AboutScroller() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 .. PANELS.length - 1
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
      setProgress(p * (PANELS.length - 1));
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
              key={p.title}
              className="rounded-[28px] md:rounded-[32px]"
              style={{ background: CARD_GREEN }}
            >
              <PanelContent title={p.title} Icon={p.Icon} />
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
          style={{ background: CARD_GREEN }}
        >
          {PANELS.map((p, i) => {
            const d = progress - i;
            // Each panel is only visible within |d| < 0.5, so the outgoing
            // panel fades fully to 0 before the incoming one appears — a clean
            // sequential fade rather than an overlapping crossfade.
            const t = Math.max(0, 1 - Math.abs(d) / 0.5);
            const opacity = t * t * (3 - 2 * t); // smoothstep for soft easing
            const translate = -Math.sign(d) * (1 - opacity) * 10;
            const active = Math.round(progress) === i;
            return (
              <div
                key={p.title}
                aria-hidden={!active}
                className="absolute inset-0"
                style={{
                  opacity,
                  transform: `translateY(${translate}px)`,
                  pointerEvents: active ? "auto" : "none",
                  willChange: "opacity, transform",
                }}
              >
                <PanelContent title={p.title} Icon={p.Icon} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PanelContent({
  title,
  Icon,
}: {
  title: string;
  Icon: () => React.ReactElement;
}) {
  return (
    <div className="flex h-full flex-col px-6 py-12 md:px-12 md:py-16 lg:px-16">
      <h2 className="text-[30px] font-medium tracking-[-0.01em] text-green md:text-[40px] lg:text-[44px]">
        {title}
      </h2>
      <div className="grid flex-1 grid-cols-1 items-center gap-10 py-8 md:grid-cols-2 md:gap-14">
        <div className="flex justify-center">
          <Icon />
        </div>
        <div className="max-w-[480px] space-y-5 text-[14px] leading-[1.65] text-green/90 md:text-[15px]">
          {BODY}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Icons ---------------- */

const ICON_CLASS = "h-[180px] w-auto md:h-[240px]";

function ReceiptIcon() {
  return <img src="/about-receipt.png" alt="" draggable={false} className={ICON_CLASS} />;
}

function CollectIcon() {
  return <img src="/about-collect.png" alt="" draggable={false} className={ICON_CLASS} />;
}

function RobotIcon() {
  return <img src="/about-robot.png" alt="" draggable={false} className={ICON_CLASS} />;
}

function ChartIcon() {
  return <img src="/about-chart.png" alt="" draggable={false} className={ICON_CLASS} />;
}
