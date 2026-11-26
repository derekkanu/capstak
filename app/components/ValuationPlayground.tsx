"use client";

import { useMemo, useState, type ReactNode } from "react";
import ComingSoonModal from "./ComingSoonModal";
import {
  quickEstimate,
  SECTORS,
  type OwnerReliance,
  type Records,
  type SectorKey,
  type Tenure,
  type Trend,
} from "../lib/quickEstimate";

/* The free quick estimate: a few plain answers, one honest method (what's left for the owner × a multiple for
   the trade, checked against sales). See lib/quickEstimate.ts for the method and where the benchmarks come from. */

const TRENDS: { label: string; value: Trend }[] = [
  { label: "Shrinking", value: "shrinking" },
  { label: "Keeping up", value: "keeping-up" },
  { label: "Growing faster", value: "growing" },
];

const TENURE: { label: string; value: Tenure }[] = [
  { label: "Under 2 yrs", value: "new" },
  { label: "2–5 yrs", value: "mid" },
  { label: "5+ yrs", value: "established" },
];

const WITHOUT_YOU: { label: string; value: OwnerReliance }[] = [
  { label: "No", value: "no" },
  { label: "Partly", value: "partly" },
  { label: "Yes", value: "yes" },
];

const RECORDS: { label: string; value: Records }[] = [
  { label: "Mostly cash", value: "cash" },
  { label: "Some", value: "some" },
  { label: "Bank & POS", value: "bank" },
];

type Tab = "range" | "breakdown" | "report";

function money(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `₦${Math.round(n / 1000)}k`;
  return `₦${Math.round(n)}`;
}

// monthly sales slider runs on a curve, so ₦200k and ₦50M are both easy to reach
const SALES_MIN = 200_000;
const SALES_MAX = 50_000_000;
const salesAt = (pos: number) => {
  const v = SALES_MIN * Math.pow(SALES_MAX / SALES_MIN, pos / 1000);
  const step = v < 1_000_000 ? 10_000 : v < 10_000_000 ? 50_000 : 250_000;
  return Math.round(v / step) * step;
};
const posFor = (v: number) => Math.round((Math.log(v / SALES_MIN) / Math.log(SALES_MAX / SALES_MIN)) * 1000);

export default function ValuationPlayground() {
  const [prompt, setPrompt] = useState("Family restaurant in Lagos, six years trading");
  // "Guided interview" is the full valuation, coming next: picking it opens the coming-soon popup
  const [soon, setSoon] = useState(false);
  const [sector, setSector] = useState<SectorKey>("food");
  const [salesPos, setSalesPos] = useState(posFor(4_000_000));
  const [leftPct, setLeftPct] = useState(18);
  const [tenure, setTenure] = useState<Tenure>("established");
  const [trend, setTrend] = useState<Trend>("growing");
  const [withoutYou, setWithoutYou] = useState<OwnerReliance>("partly");
  const [records, setRecords] = useState<Records>("some");
  const [tab, setTab] = useState<Tab>("range");
  const [pulse, setPulse] = useState(0);

  // the first five trades, plus the chosen one if it's further down the list, so a pick never disappears
  const [allTrades, setAllTrades] = useState(false);
  const picked = SECTORS.findIndex((t) => t.key === sector);
  const shownTrades = picked < 5 ? SECTORS.slice(0, 5) : [...SECTORS.slice(0, 4), SECTORS[picked]];

  const monthlySales = salesAt(salesPos);
  const monthlyLeft = Math.round((monthlySales * leftPct) / 100 / 1000) * 1000;

  const r = useMemo(
    () => quickEstimate({ sector, monthlySales, monthlyLeft, tenure, trend, withoutYou, records }),
    [sector, monthlySales, monthlyLeft, tenure, trend, withoutYou, records],
  );

  return (
    <div className="relative mx-auto w-full max-w-[1120px] text-left">
      <ComingSoonModal open={soon} onClose={() => setSoon(false)} />
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
            value={"estimate" as "estimate" | "interview"}
            onChange={(v) => v === "interview" && setSoon(true)}
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
            <button
              type="button"
              aria-label="Recalculate"
              onClick={() => setPulse((p) => p + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-green text-lime shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors hover:bg-green-mid"
            >
              <ArrowUp />
            </button>
          </div>
        </div>
      </div>

      {/* Control + output panel */}
      <div className="-mt-5 grid grid-cols-1 overflow-hidden rounded-b-[20px] border border-t-0 border-ink/[0.08] bg-white/55 pt-5 backdrop-blur-xl md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Controls */}
        <div className="flex flex-col gap-6 p-5 md:border-r md:border-ink/[0.08] md:p-6">
          <Field label="What do you do?">
            {/* five trades and "More", three rows; the rest open in place */}
            <div className="grid grid-cols-2 gap-1.5">
              {(allTrades ? SECTORS : shownTrades).map((opt) => (
                <Chip key={opt.key} active={opt.key === sector} onClick={() => setSector(opt.key)}>
                  {opt.label}
                </Chip>
              ))}
              <Chip active={false} onClick={() => setAllTrades((v) => !v)}>
                {allTrades ? "Fewer" : "More…"}
              </Chip>
            </div>
          </Field>

          <Slider
            label="Sales in a normal month"
            value={salesPos}
            display={money(monthlySales)}
            min={0}
            max={1000}
            step={1}
            onChange={setSalesPos}
          />
          <Slider
            label="Left for you each month"
            hint="After all costs, before paying yourself"
            value={leftPct}
            display={`${money(monthlyLeft)} · ${leftPct}%`}
            min={0}
            max={60}
            step={1}
            onChange={setLeftPct}
          />

          <Field label="How long have you been trading?">
            <Segmented value={tenure} onChange={setTenure} options={TENURE} full />
          </Field>
          <Field label="Sales compared with a year ago, against rising prices">
            <Segmented value={trend} onChange={setTrend} options={TRENDS} full />
          </Field>
          <Field label="Could it run for a month without you?">
            <Segmented value={withoutYou} onChange={setWithoutYou} options={WITHOUT_YOU} full />
          </Field>
          <Field label="How are your sales recorded?">
            <Segmented value={records} onChange={setRecords} options={RECORDS} full />
          </Field>

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
                { value: "report", label: "Full report" },
              ]}
            />
            {r.ok ? (
              <span className="num inline-flex items-center gap-1.5 rounded-[8px] bg-[#34c759]/15 px-2.5 py-1.5 text-[14px] font-medium text-[#1d7a3a]">
                {r.multiple.toFixed(1)}× a year&rsquo;s earnings
              </span>
            ) : null}
          </div>

          <div key={`${tab}-${pulse}`} className="playground-in mt-5 flex flex-1 flex-col gap-2.5">
            {!r.ok ? (
              <div className="rounded-[14px] border border-ink/[0.08] bg-white p-5">
                <p className="text-[14px] text-ink/50">Estimated value · {r.sector.label}</p>
                <p className="display num mt-1 text-[40px] leading-none text-ink/40">No number yet</p>
                <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.55] text-ink/65">{r.reason}</p>
              </div>
            ) : null}

            {r.ok && tab === "range" && (
              <>
                <div className="rounded-[14px] border border-ink/[0.08] bg-white p-5">
                  <p className="text-[14px] text-ink/50">Rough value before debts · {r.sector.label}</p>
                  <p className="display num mt-1 text-[48px] leading-none text-ink md:text-[56px]">{money(r.mid)}</p>
                  <RangeBar low={r.low} mid={r.mid} high={r.high} />
                  <p className="mt-3 text-[13px] text-ink/50">
                    Confidence: <span className="font-medium text-ink/75">{r.confidence}</span> · ±{Math.round(r.spread * 100)}%.
                    {r.confidence !== "Good" ? " Bank and POS records narrow it." : ""}
                  </p>
                </div>
                <ResultRow
                  title="Earnings view"
                  value={money(r.earningsValue)}
                  detail={`${money(r.yearlyLeft)} left a year × ${r.multiple.toFixed(1)}`}
                  faded={r.capped}
                />
                <ResultRow
                  title={r.capped ? "Capped by sales" : "Sales check"}
                  value={money(r.salesCeiling)}
                  detail={`Buyers in ${r.sector.label.toLowerCase()} rarely pay over ${r.sector.salesCap}× a year's sales (${money(r.yearlySales)})`}
                  strong={r.capped}
                  faded={!r.capped}
                />
              </>
            )}

            {r.ok && tab === "breakdown" && (
              <>
                <ResultRow
                  title={`${r.sector.label}, typical`}
                  value={`${r.sector.multiple.toFixed(1)}×`}
                  detail="What small businesses in this trade sell for, in years of earnings"
                />
                {r.steps.length ? (
                  r.steps.map((a) => (
                    <ResultRow
                      key={a.label}
                      title={a.label}
                      value={`${a.delta > 0 ? "+" : "−"}${Math.abs(a.delta).toFixed(1)}×`}
                      tone={a.delta > 0 ? "up" : "down"}
                      detail={a.why}
                    />
                  ))
                ) : (
                  <ResultRow title="No adjustments" value="0.0×" detail="Your answers sit right at the norm for the trade" />
                )}
                <ResultRow title="Your multiple" value={`${r.multiple.toFixed(1)}×`} detail="Applied to what's left for you in a year" strong />
              </>
            )}

            {r.ok && tab === "report" && (
              <>
                <ResultRow title="What the full valuation adds" value="" detail="Your real numbers from bank statements, so the range narrows" />
                <ResultRow title="Debts and assets" value="" detail="Loans netted out; equipment, stock and property counted" />
                <ResultRow title="Three methods, not one" value="" detail="Market, earnings over time and assets, blended by how sure we are" />
                <ResultRow title="Your business model" value="" detail="Customers, suppliers and risks that move the multiple" />
                <ResultRow title="A report to share" value="" detail="For a buyer, a broker or a bank, every reason written down" faded />
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
  hint,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
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
      {hint ? <span className="-mt-1 mb-2 block text-[12px] text-ink/40">{hint}</span> : null}
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
