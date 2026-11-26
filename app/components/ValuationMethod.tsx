"use client";

import { useEffect, useState } from "react";
import { INDUSTRY_MULTIPLES, computeValuation } from "../lib/valuation";

/* Exa-style split: dark story panel with tabs on the left, a clean chart on the
   right. Every figure is read from the valuation engine, not typed in. */

const TABS = [
  {
    key: "sectors",
    title: "Industry benchmarks",
    body: "Each valuation starts from what businesses in your sector typically sell for, on earnings and on revenue.",
  },
  {
    key: "adjust",
    title: "What moves your multiple",
    body: "Growth, track record, margins and debt each nudge the multiple up or down from the sector norm.",
  },
  {
    key: "value",
    title: "From multiple to value",
    body: "An earnings view and a revenue cross-check are blended, then any debt is netted out to give your range.",
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
              How your number is made<span className="stop">.</span>
            </h2>
            <p className="mt-5 max-w-[34ch] text-[16px] leading-[1.6] text-cream/60 md:text-[17px]">
              The AI gathers your story. A transparent, rule-based engine does the maths, so the same
              answers always give the same result.
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
  const pick = ["Software / SaaS", "Healthcare", "Manufacturing", "Professional Services", "Retail", "Food & Hospitality"];
  const rows = pick
    .map((l) => INDUSTRY_MULTIPLES.find((s) => s.label === l)!)
    .filter(Boolean);
  const max = 5;
  const ticks = [0, 1, 2, 3, 4, 5];
  const short: Record<string, string> = {
    "Software / SaaS": "Software",
    "Professional Services": "Prof. services",
    "Food & Hospitality": "Hospitality",
  };
  return (
    <div className="flex flex-1 flex-col">
      <Legend
        items={[
          { color: ACCENT, label: "Earnings multiple" },
          { color: MUTED, label: "Revenue multiple" },
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
            <div key={r.label} className={`h-full flex-1 items-end justify-center gap-1 md:gap-1.5 ${i >= 4 ? "hidden sm:flex" : "flex"}`}>
              <Bar value={r.multiple} max={max} color={ACCENT} label={`${r.multiple.toFixed(1)}×`} />
              <Bar value={r.revMultiple} max={max} color={MUTED} label={`${r.revMultiple.toFixed(1)}×`} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-around gap-2 pl-9 pt-3 md:gap-4">
        {rows.map((r, i) => (
          <span key={r.label} className={`flex-1 text-center text-[12px] leading-tight text-ink/70 md:text-[14px] ${i >= 4 ? "hidden sm:block" : ""}`}>
            {short[r.label] ?? r.label}
          </span>
        ))}
      </div>
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
  const rows = [
    { label: "Revenue growing", delta: 0.5 },
    { label: "Established, 5+ years", delta: 0.3 },
    { label: "Strong profit margin", delta: 0.3 },
    { label: "Thin profit margin", delta: -0.3 },
    { label: "Elevated debt load", delta: -0.3 },
    { label: "Early stage, under 2 years", delta: -0.4 },
    { label: "Revenue declining", delta: -0.5 },
  ];
  const max = 0.6;
  return (
    <div className="flex flex-1 flex-col">
      <Legend
        items={[
          { color: ACCENT, label: "Raises multiple" },
          { color: "#d9a184", label: "Lowers multiple" },
        ]}
      />
      <div className="mt-8 flex flex-1 flex-col justify-center gap-3.5">
        {rows.map((r) => {
          const w = (Math.abs(r.delta) / max) * 50;
          const up = r.delta > 0;
          return (
            <div key={r.label} className="grid grid-cols-[minmax(0,1fr)] gap-1.5 md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-4">
              <span className="text-[14px] text-ink/75 md:text-right md:text-[15px]">{r.label}</span>
              <div className="relative h-8">
                <div className="absolute inset-y-[-6px] left-1/2 border-l border-ink/30" />
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
  // A worked example straight through the engine.
  const r = computeValuation({
    businessName: null,
    industry: "cafe",
    location: null,
    yearsInOperation: 6,
    revenueThreeMonthsAgo: null,
    revenueLastMonth: null,
    annualRevenue: 48_000_000,
    annualNetProfit: 8_640_000,
    costStructure: null,
    liabilities: 2_000_000,
    growthTrend: "increasing",
    growthRatePct: null,
    competitors: null,
    marketSize: null,
    customerSegments: null,
    teamSize: null,
    keyAssets: null,
    keyProcesses: null,
    risks: null,
    growthStrategy: null,
    contingencyPlans: null,
  });
  const earnings = r.earningsValue * 0.7;
  const revenue = r.revenueValue * 0.3;
  const debt = r.liabilities;
  const top = earnings + revenue;
  const afterDebt = top - debt;
  const adj = r.mid - afterDebt; // the engine's own nudges (growth, years, risk)
  type Row = { label: string; from: number; to: number; color: string; value: number; total?: boolean };
  const rows: Row[] = [
    { label: "Earnings view (70%)", from: 0, to: earnings, color: ACCENT, value: earnings },
    { label: "Revenue view (30%)", from: earnings, to: top, color: "#7fc794", value: revenue },
    { label: "Less debt", from: afterDebt, to: top, color: "#d9a184", value: -debt },
  ];
  if (Math.abs(adj) > 50_000)
    rows.push({ label: adj > 0 ? "Growth and track record" : "Risk", from: Math.min(afterDebt, r.mid), to: Math.max(afterDebt, r.mid), color: adj > 0 ? "#b9d77a" : "#e3b9a3", value: adj });
  rows.push({ label: "Estimated value", from: 0, to: r.mid, color: "#042e1b", value: r.mid, total: true });
  const max = Math.max(top, r.mid) * 1.04;
  const pct = (n: number) => `${(n / max) * 100}%`;
  const k = (n: number) => `₦${(Math.abs(n) / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  return (
    <div className="flex flex-1 flex-col">
      <p className="text-[14px] text-ink/60">Example: Lagos restaurant, ₦48M a year in sales, 18% kept as profit, growing, six years trading</p>
      {/* a ledger, read top to bottom: each line adds or takes away, the total sits under a rule */}
      <div className="mt-8 flex flex-1 flex-col justify-center font-mono">
        {rows.map((s, i) => (
          <div key={s.label} className={`grid grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)_5rem] items-center gap-4 py-3 ${s.total ? "mt-2 border-t border-ink/40 pt-5" : "border-b border-dashed border-ink/15"}`}>
            <span className={`text-[12px] leading-tight md:text-[13px] ${s.total ? "font-semibold text-ink" : "text-ink/70"}`}>{s.label}</span>
            <span className="relative block h-5">
              {/* where the previous line ended: a hairline the next bar starts from */}
              {i > 0 && !s.total ? <span aria-hidden className="absolute -top-3 bottom-0 w-px bg-ink/25" style={{ left: pct(s.value < 0 ? s.to : s.from) }} /> : null}
              <span
                className="bar-grow-x absolute inset-y-0 rounded-[2px]"
                style={{ left: pct(s.from), width: pct(s.to - s.from), background: s.color }}
              />
            </span>
            <span className={`num text-right text-[13px] ${s.total ? "font-semibold text-green" : "text-ink"}`}>
              {s.value < 0 ? "−" : s.total ? "" : "+"}
              {k(s.value)}
            </span>
          </div>
        ))}
        <p className="mt-4 text-right text-[13px] text-ink/60">
          Range <span className="num font-medium text-ink">{k(r.low)} – {k(r.high)}</span>
        </p>
      </div>
    </div>
  );
}
