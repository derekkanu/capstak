"use client";

import { useMemo, useState, type ReactNode } from "react";
import DemoLauncher from "./DemoLauncher";
import {
  computeValuation,
  type GrowthTrend,
  type ValuationInput,
} from "../lib/valuation";

/* A live, in-page valuation preview modelled on Exa's API playground. Every
   number comes from the same deterministic engine the full demo uses. */

const INDUSTRIES = [
  { label: "Food & hospitality", value: "cafe" },
  { label: "Retail", value: "retail" },
  { label: "Services", value: "services" },
  { label: "Software", value: "software" },
  { label: "Healthcare", value: "clinic" },
  { label: "Construction", value: "construction" },
];

const TRENDS: { label: string; value: GrowthTrend }[] = [
  { label: "Declining", value: "decreasing" },
  { label: "Steady", value: "steady" },
  { label: "Growing", value: "increasing" },
];

const TENURE = [
  { label: "Under 2 yrs", value: 1 },
  { label: "2–5 yrs", value: 3 },
  { label: "5+ yrs", value: 6 },
];

type Tab = "range" | "breakdown" | "report";

function money(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 2).replace(/\.?0+$/, "")}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n)}`;
}

function baseInput(): ValuationInput {
  return {
    businessName: null,
    industry: null,
    location: null,
    yearsInOperation: null,
    revenueThreeMonthsAgo: null,
    revenueLastMonth: null,
    annualRevenue: null,
    annualNetProfit: null,
    costStructure: null,
    liabilities: null,
    growthTrend: null,
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
  };
}

export default function ValuationPlayground() {
  const [prompt, setPrompt] = useState("Family café in Austin, six years trading");
  const [mode, setMode] = useState<"estimate" | "interview">("estimate");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [trend, setTrend] = useState<GrowthTrend>("increasing");
  const [years, setYears] = useState(6);
  const [revenue, setRevenue] = useState(480_000);
  const [margin, setMargin] = useState(18);
  const [tab, setTab] = useState<Tab>("range");
  const [pulse, setPulse] = useState(0);

  const result = useMemo(
    () =>
      computeValuation({
        ...baseInput(),
        industry: industry.value,
        yearsInOperation: years,
        growthTrend: trend,
        annualRevenue: revenue,
        annualNetProfit: (revenue * margin) / 100,
      }),
    [industry, years, trend, revenue, margin],
  );

  const profit = (revenue * margin) / 100;
  const sectorRevMultiple = result.annualRevenue
    ? result.revenueValue / result.annualRevenue
    : 0;

  return (
    <div className="relative mx-auto w-full max-w-[1120px] text-left">
      {/* Prompt bar */}
      <div className="relative z-10 rounded-[20px] border border-ink/10 bg-white p-3 shadow-[0_24px_60px_-30px_rgba(12,29,18,0.35)] md:p-4">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          aria-label="Describe your business"
          placeholder="Describe your business…"
          className="w-full bg-transparent px-2 pb-3 pt-1 text-[18px] text-ink placeholder:text-ink/35 focus:outline-none md:text-[22px]"
        />
        <div className="flex items-center justify-between gap-3">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "estimate", label: "Quick estimate", icon: <CalcIcon /> },
              { value: "interview", label: "Guided interview", icon: <ChatIcon /> },
            ]}
            size="lg"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Clear description"
              onClick={() => setPrompt("")}
              className="hidden h-11 w-11 items-center justify-center rounded-[12px] bg-ink/[0.05] text-ink/60 transition-colors hover:bg-ink/[0.09] hover:text-ink sm:flex"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            {mode === "interview" ? (
              <DemoLauncher
                variant="plain"
                className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-green text-lime shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors hover:bg-green-mid"
              >
                <ArrowUp />
                <span className="sr-only">Start guided interview</span>
              </DemoLauncher>
            ) : (
              <button
                type="button"
                aria-label="Recalculate"
                onClick={() => setPulse((p) => p + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-green text-lime shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors hover:bg-green-mid"
              >
                <ArrowUp />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control + output panel */}
      <div className="-mt-5 grid grid-cols-1 overflow-hidden rounded-b-[20px] border border-t-0 border-ink/[0.08] bg-white/55 pt-5 backdrop-blur-xl md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Controls */}
        <div className="flex flex-col gap-6 p-5 md:border-r md:border-ink/[0.08] md:p-6">
          <Field label="Industry">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {INDUSTRIES.map((opt) => (
                <Chip
                  key={opt.value}
                  active={opt.value === industry.value}
                  onClick={() => setIndustry(opt)}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Revenue trend">
            <Segmented value={trend} onChange={setTrend} options={TRENDS} full />
          </Field>

          <Field label="Time trading">
            <Segmented value={years} onChange={setYears} options={TENURE} full />
          </Field>

          <Slider
            label="Annual revenue"
            value={revenue}
            display={money(revenue)}
            min={100_000}
            max={3_000_000}
            step={10_000}
            onChange={setRevenue}
          />
          <Slider
            label="Profit margin"
            value={margin}
            display={`${margin}%`}
            min={2}
            max={40}
            step={1}
            onChange={setMargin}
          />

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <DemoLauncher variant="plain" className="inline-flex items-center gap-2 rounded-[10px] border border-ink/10 bg-white px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:border-ink/20">
              Run the full interview
              <ExternalIcon />
            </DemoLauncher>
          </div>
        </div>

        {/* Output */}
        <div className="flex min-h-[460px] flex-col p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: "range", label: "Range" },
                { value: "breakdown", label: "Breakdown" },
                { value: "report", label: "Report" },
              ]}
            />
            <span className="num inline-flex items-center gap-1.5 rounded-[8px] bg-[#34c759]/15 px-2.5 py-1.5 text-[14px] font-medium text-[#1d7a3a]">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {result.adjustedMultiple.toFixed(1)}× multiple
            </span>
          </div>

          <div key={`${tab}-${pulse}`} className="playground-in mt-5 flex flex-1 flex-col gap-2.5">
            {tab === "range" && (
              <>
                <div className="rounded-[14px] border border-ink/[0.08] bg-white p-5">
                  <p className="text-[14px] text-ink/50">Estimated value · {result.industryLabel}</p>
                  <p className="display num mt-1 text-[48px] leading-none text-ink md:text-[56px]">
                    {money(result.mid)}
                  </p>
                  <RangeBar low={result.low} mid={result.mid} high={result.high} />
                </div>
                <ResultRow
                  title="Earnings view"
                  value={money(result.earningsValue)}
                  detail={`${money(profit)} profit × ${result.adjustedMultiple.toFixed(1)} adjusted multiple, weighted 70%`}
                />
                <ResultRow
                  title="Revenue cross-check"
                  value={money(result.revenueValue)}
                  detail={`${money(revenue)} revenue × ${sectorRevMultiple.toFixed(1)} sector multiple, weighted 30%`}
                  faded
                />
              </>
            )}

            {tab === "breakdown" && (
              <>
                <ResultRow
                  title={`${result.industryLabel} benchmark`}
                  value={`${result.baseMultiple.toFixed(1)}×`}
                  detail="Typical earnings multiple for businesses in this sector"
                />
                {result.adjustments.length ? (
                  result.adjustments.map((a) => (
                    <ResultRow
                      key={a.label}
                      title={a.label}
                      value={`${a.delta > 0 ? "+" : "−"}${Math.abs(a.delta).toFixed(1)}×`}
                      tone={a.delta > 0 ? "up" : "down"}
                      detail={a.delta > 0 ? "Raises the multiple buyers will pay" : "Lowers the multiple buyers will pay"}
                    />
                  ))
                ) : (
                  <ResultRow title="No adjustments" value="0.0×" detail="Your answers sit right at the sector norm" />
                )}
                <ResultRow
                  title="Your multiple"
                  value={`${result.adjustedMultiple.toFixed(1)}×`}
                  detail="Applied to your annual profit"
                  strong
                />
              </>
            )}

            {tab === "report" && (
              <>
                <ResultRow title="Business overview" value="p. 1" detail={`${prompt || "Your business"} · ${result.industryLabel}`} />
                <ResultRow title="Financials" value="p. 2" detail={`${money(revenue)} revenue · ${margin}% margin · ${money(profit)} profit`} />
                <ResultRow title="Valuation range" value="p. 3" detail={`${money(result.low)} – ${money(result.high)}, midpoint ${money(result.mid)}`} />
                <ResultRow title="What moves your value" value="p. 4" detail="Growth, track record, margin and debt, explained in plain English" />
                <ResultRow title="Risks & strategy" value="p. 5" detail="Where the value could go next, and how to protect it" faded />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-ink/45">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`truncate rounded-[9px] px-2.5 py-2 text-[14px] transition-all ${
        active
          ? "bg-white text-ink shadow-[0_1px_2px_rgba(12,29,18,0.08),0_0_0_1px_rgba(12,29,18,0.06)]"
          : "bg-ink/[0.04] text-ink/55 hover:bg-ink/[0.07] hover:text-ink/80"
      }`}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  size = "md",
  full = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  size?: "md" | "lg";
  full?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex rounded-[12px] bg-ink/[0.05] p-1 ${full ? "flex w-full" : ""}`}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] font-medium transition-all ${
              full ? "flex-1" : ""
            } ${size === "lg" ? "px-3 py-2 text-[14px] md:px-4 md:text-[16px]" : "px-3 py-1.5 text-[14px]"} ${
              on
                ? "bg-white text-ink shadow-[0_1px_2px_rgba(12,29,18,0.1)]"
                : "text-ink/45 hover:text-ink/75"
            }`}
          >
            {o.icon}
            <span className={o.icon ? "hidden sm:inline" : ""}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink/45">{label}</span>
        <span className="num text-[14px] font-medium text-ink">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="playground-range w-full"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
    </label>
  );
}

function ResultRow({
  title,
  value,
  detail,
  faded = false,
  strong = false,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  faded?: boolean;
  strong?: boolean;
  tone?: "up" | "down";
}) {
  return (
    <div
      className={`rounded-[14px] border px-4 py-3.5 transition-opacity ${
        strong ? "border-green/20 bg-[#eef6e6]" : "border-ink/[0.08] bg-white"
      } ${faded ? "opacity-45 [mask-image:linear-gradient(180deg,#000_30%,transparent)]" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="truncate text-[16px] font-medium text-ink">{title}</p>
        <p
          className={`num shrink-0 text-[15px] font-medium ${
            tone === "up" ? "text-[#1d7a3a]" : tone === "down" ? "text-[#b4532a]" : "text-ink/55"
          }`}
        >
          {value}
        </p>
      </div>
      <p className="mt-1 truncate text-[14px] text-ink/50">{detail}</p>
    </div>
  );
}

function RangeBar({ low, mid, high }: { low: number; mid: number; high: number }) {
  return (
    <div className="mt-5">
      <div className="relative h-2 rounded-full bg-ink/[0.07]">
        <div className="absolute inset-y-0 left-[15%] right-[15%] rounded-full bg-gradient-to-r from-[#34c759]/60 via-[#34c759] to-[#34c759]/60" />
        <div className="absolute -top-1.5 left-1/2 h-5 w-[3px] -translate-x-1/2 rounded-full bg-green" />
      </div>
      <div className="num mt-2.5 flex justify-between text-[13px] text-ink/50">
        <span>Low {money(low)}</span>
        <span className="text-ink/70">Mid {money(mid)}</span>
        <span>High {money(high)}</span>
      </div>
    </div>
  );
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M10 16V4M4.5 9.5L10 4l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden>
      <rect x="4" y="2.5" width="12" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6.5" y="5" width="7" height="3" rx="0.8" fill="currentColor" />
      <circle cx="7.5" cy="11.5" r="0.9" fill="currentColor" />
      <circle cx="10" cy="11.5" r="0.9" fill="currentColor" />
      <circle cx="12.5" cy="11.5" r="0.9" fill="currentColor" />
      <circle cx="7.5" cy="14.5" r="0.9" fill="currentColor" />
      <circle cx="10" cy="14.5" r="0.9" fill="currentColor" />
      <circle cx="12.5" cy="14.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] text-[#1d7a3a]" fill="none" aria-hidden>
      <path d="M4 4.5h12a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H9l-3.5 3v-3H4A1.5 1.5 0 012.5 13V6A1.5 1.5 0 014 4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 8.5h7M6.5 11h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-ink/60" fill="none" aria-hidden>
      <path d="M6.5 3.5H4A1.5 1.5 0 002.5 5v7A1.5 1.5 0 004 13.5h7a1.5 1.5 0 001.5-1.5V9.5M9.5 2.5h4v4M13.5 2.5L7.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
