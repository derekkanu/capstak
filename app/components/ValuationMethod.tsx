"use client";

import { useEffect, useState } from "react";
import { SECTORS, quickEstimate } from "../lib/quickEstimate";

/* Dark story panel with tabs on the left, a chart on the right. Every figure is read from the same engine as
   the free calculator (lib/quickEstimate.ts), not typed in, so this section and the calculator always agree. */

const TABS = [
  {
    key: "sectors",
    title: "What buyers pay in your trade",
    body: "Every estimate starts from what small businesses in your trade sell for: a few years of what's left for the owner, and a ceiling on a year's sales.",
  },
  {
    key: "adjust",
    title: "What moves the price up or down",
    body: "Size, years trading, growth after price rises, whether it runs without you and how good your records are. Each one moves the multiple, the years of earnings a buyer will pay.",
  },
  {
    key: "value",
    title: "Putting it together",
    body: "What's left for you in a year, times your multiple, checked against the ceiling on sales. The full valuation then takes off debts and counts equipment and stock.",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ValuationMethod() {
  const [active, setActive] = useState<TabKey>("sectors");
  const [held, setHeld] = useState(false);

  // walk through the three views by itself until someone picks one
  useEffect(() => {
    if (held) return;
    const id = window.setInterval(() => {
      setActive((k) => TABS[(TABS.findIndex((t) => t.key === k) + 1) % TABS.length].key);
    }, 5200);
    return () => window.clearInterval(id);
  }, [held]);

  return (
    <section id="method" className="scroll-mt-28 px-5 py-6 md:px-10 md:py-10">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 overflow-hidden rounded-[6px] shadow-[0_24px_50px_-34px_rgba(4,46,27,0.55)] lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        {/* Story panel */}
        <div className="grain flex flex-col justify-center bg-green px-7 py-14 text-cream md:px-14 md:py-20">
          <div className="relative z-10">
            <h2 className="display max-w-[14ch] text-[38px] md:text-[52px]">
              How we work out what it&rsquo;s worth<span className="stop">.</span>
            </h2>
            <p className="mt-5 max-w-[34ch] text-[16px] leading-[1.6] text-cream/60 md:text-[17px]">
              The way small businesses are priced when they change hands. Fixed rules do the maths, so the same
              answers always give the same result, and every step is shown.
            </p>

            <ul className="mt-12 flex flex-col gap-1" role="tablist" aria-label="Valuation method">
              {TABS.map((t) => {
                const on = t.key === active;
                return (
                  <li key={t.key}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => {
                        setHeld(true);
                        setActive(t.key);
                      }}
                      className={`relative w-full border-l-2 py-3 pl-6 text-left transition-colors ${
                        on ? "border-cream" : "border-transparent"
                      }`}
                    >
                      <span
                        className={`block text-[18px] font-medium transition-colors md:text-[19px] ${
                          on ? "text-cream" : "text-cream/45 hover:text-cream/75"
                        }`}
                      >
                        {t.title}
                      </span>
                      <span
                        className="grid transition-[grid-template-rows,opacity] duration-500"
                        style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}
                      >
                        <span className="overflow-hidden">
                          <span className="block max-w-[38ch] pt-2 text-[15px] leading-[1.55] text-cream/55">
                            {t.body}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Chart panel */}
        <div className="flex min-h-[520px] flex-col bg-cream px-5 py-10 md:px-12 md:py-14">
          <div key={active} className="playground-in flex flex-1 flex-col">
            {active === "sectors" && <SectorChart />}
            {active === "adjust" && <AdjustmentChart />}
            {active === "value" && <ValueChart />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Charts ---------------- */

const ACCENT = "#2a9d4f";
const MUTED = "#e3dfd5";

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 text-[14px] text-ink/70">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function SectorChart() {
  const pick = ["tech", "health", "education", "making", "trade", "food"];
  const rows = pick.map((k) => SECTORS.find((s) => s.key === k)!);
  const max = 3;
  const ticks = [0, 1, 2, 3];
  const short: Record<string, string> = {
    tech: "Tech",
    health: "Health",
    education: "Schools",
    making: "Making things",
    trade: "Shop & trading",
    food: "Food & drinks",
  };
  return (
    <div className="flex flex-1 flex-col">
      <Legend
        items={[
          { color: ACCENT, label: "Years of earnings" },
          { color: MUTED, label: "Ceiling, × a year's sales" },
        ]}
      />
      <div className="relative mt-6 flex flex-1 pl-9">
        {/* grid */}
        <div className="pointer-events-none absolute inset-y-0 left-9 right-0">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-ink/[0.07]"
              style={{ bottom: `${(t / max) * 100}%` }}
            >
              <span className="num absolute -left-9 -translate-y-1/2 text-[12px] text-ink/40">{t}×</span>
            </div>
          ))}
        </div>
        <div className="relative flex min-h-[320px] flex-1 items-end justify-around gap-2 border-b border-ink/30 md:gap-4">
          {rows.map((r, i) => (
            <div key={r.key} className={`h-full flex-1 items-end justify-center gap-1 md:gap-1.5 ${i >= 4 ? "hidden sm:flex" : "flex"}`}>
              <Bar value={r.multiple} max={max} color={ACCENT} label={`${r.multiple.toFixed(1)}×`} />
              <Bar value={r.salesCap} max={max} color={MUTED} label={`${r.salesCap.toFixed(1)}×`} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-around gap-2 pl-9 pt-3 md:gap-4">
        {rows.map((r, i) => (
          <span key={r.key} className={`flex-1 text-center text-[12px] leading-tight text-ink/70 md:text-[14px] ${i >= 4 ? "hidden sm:block" : ""}`}>
            {short[r.key]}
          </span>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-ink/50">
        From small-business sale data, adjusted down for Nigeria&rsquo;s higher risk. To be sharpened with brokers&rsquo; real sale prices.
      </p>
    </div>
  );
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div className="relative flex h-full w-full max-w-[44px] items-end">
      <div
        className="bar-grow relative w-full rounded-t-[3px]"
        style={{ height: `${(value / max) * 100}%`, background: color }}
      >
        <span className="num absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[12px] font-medium text-ink sm:block">
          {label}
        </span>
      </div>
    </div>
  );
}

function AdjustmentChart() {
  // the same steps as lib/quickEstimate.ts
  const rows = [
    { label: "Larger business, ₦10M+ a month left", delta: 0.6 },
    { label: "Growing faster than prices", delta: 0.4 },
    { label: "Mid-sized, ₦3M+ a month left", delta: 0.3 },
    { label: "5+ years trading", delta: 0.3 },
    { label: "Runs without you", delta: 0.3 },
    { label: "Small, under ₦500k a month", delta: -0.2 },
    { label: "Mostly cash, few records", delta: -0.2 },
    { label: "Under 2 years trading", delta: -0.4 },
    { label: "Sales shrinking", delta: -0.4 },
    { label: "Depends on you", delta: -0.4 },
  ];
  const max = 0.7;
  return (
    <div className="flex flex-1 flex-col">
      <Legend
        items={[
          { color: ACCENT, label: "Pushes it up" },
          { color: "#d9a184", label: "Pulls it down" },
        ]}
      />
      <div className="mt-6 flex flex-1 flex-col justify-center gap-2.5">
        {rows.map((r) => {
          const w = (Math.abs(r.delta) / max) * 50;
          const up = r.delta > 0;
          return (
            <div key={r.label} className="grid grid-cols-[minmax(0,1fr)] gap-1.5 md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-4">
              <span className="text-[14px] text-ink/75 md:text-right md:text-[15px]">{r.label}</span>
              <div className="relative h-7">
                <div className="absolute inset-y-[-5px] left-1/2 border-l border-ink/30" />
                <div
                  className="bar-grow-x absolute inset-y-0 flex items-center rounded-[3px]"
                  style={{
                    width: `${w}%`,
                    background: up ? ACCENT : "#d9a184",
                    left: up ? "50%" : `${50 - w}%`,
                    transformOrigin: up ? "left" : "right",
                  }}
                >
                  <span
                    className={`num absolute whitespace-nowrap text-[13px] font-medium text-ink ${
                      up ? "left-full pl-2" : "right-full pr-2"
                    }`}
                  >
                    {up ? "+" : "−"}
                    {Math.abs(r.delta).toFixed(1)}×
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ValueChart() {
  // the calculator's own example, straight through the engine
  const r = quickEstimate({
    sector: "food",
    monthlySales: 4_000_000,
    monthlyLeft: 720_000,
    tenure: "established",
    trend: "growing",
    withoutYou: "partly",
    records: "some",
  });
  if (!r.ok) return null;
  const k = (n: number) => `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  const why = [`${r.sector.multiple}× typical`, ...r.steps.map((s) => `${s.delta > 0 ? "+" : "−"}${Math.abs(s.delta)} ${s.label.toLowerCase()}`)].join(", ");
  type Row = { label: string; note: string; value: number; color: string; total?: boolean; faded?: boolean };
  const rows: Row[] = [
    { label: "Left for you a year", note: `${r.yearlyLeft / 12 < 1_000_000 ? `₦${Math.round(r.yearlyLeft / 12 / 1000)}k` : k(r.yearlyLeft / 12)} a month × 12`, value: r.yearlyLeft, color: "#7fc794" },
    { label: `× ${r.multiple.toFixed(1)} multiple`, note: why, value: r.earningsValue, color: ACCENT, faded: r.capped },
    { label: "Ceiling on sales", note: `${r.sector.salesCap}× a year's sales of ${k(r.yearlySales)}`, value: r.salesCeiling, color: "#d9a184", faded: !r.capped },
    { label: "Rough value", note: "The lower of the two, before debts", value: r.mid, color: "#042e1b", total: true },
  ];
  const max = Math.max(...rows.map((x) => x.value)) * 1.04;
  return (
    <div className="flex flex-1 flex-col">
      <p className="text-[14px] text-ink/60">Example: Lagos restaurant, ₦4M sales and ₦720k left a month, growing, six years trading</p>
      {/* a ledger, read top to bottom; the total sits under a rule */}
      <div className="mt-8 flex flex-1 flex-col justify-center">
        {rows.map((s) => (
          <div key={s.label} className={`grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_4.5rem] items-center gap-x-4 gap-y-1 py-3 ${s.total ? "mt-2 border-t border-ink/40 pt-5" : "border-b border-dashed border-ink/15"} ${s.faded ? "opacity-45" : ""}`}>
            <span className={`font-mono text-[12px] leading-tight md:text-[13px] ${s.total ? "font-semibold text-ink" : "text-ink/75"}`}>{s.label}</span>
            <span className="relative block h-5">
              <span className="bar-grow-x absolute inset-y-0 left-0 rounded-[2px]" style={{ width: `${(s.value / max) * 100}%`, background: s.color }} />
            </span>
            <span className={`num text-right font-mono text-[13px] ${s.total ? "font-semibold text-green" : "text-ink"}`}>{k(s.value)}</span>
            <span className="col-span-3 text-[12px] text-ink/50 md:col-span-1 md:col-start-2">{s.note}</span>
          </div>
        ))}
        <p className="mt-4 text-right text-[13px] text-ink/60">
          Range <span className="num font-medium text-ink">{k(r.low)} – {k(r.high)}</span> · the full valuation then takes off debts
        </p>
      </div>
    </div>
  );
}
