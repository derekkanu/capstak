"use client";

import { useState } from "react";
import {
  formatCurrency,
  type ValuationInput,
  type ValuationResult,
} from "../lib/valuation";

type Props = {
  input: ValuationInput;
  result: ValuationResult;
  onRestart: () => void;
};

export default function ValuationReport({ input, result, onRestart }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { generatePdf } = await import("../lib/valuationPdf");
      generatePdf(input, result);
    } finally {
      setDownloading(false);
    }
  };

  const name = input.businessName || "Your Business";

  return (
    <div className="mx-auto w-full max-w-[860px] px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-2 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-green/60">
            Valuation Report
          </p>
          <h2 className="mt-1 text-[26px] font-medium leading-tight tracking-[-0.01em] text-ink md:text-[32px]">
            {name}
          </h2>
          <p className="mt-1 text-[13px] text-ink/55">
            {result.industryLabel}
            {input.location ? ` · ${input.location}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-[10px] border border-ink/15 px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-ink/5"
          >
            Start over
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-[10px] bg-green px-4 py-2.5 text-[13px] font-medium text-lime transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <DownloadIcon />
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Headline valuation */}
      <div
        className="mt-6 overflow-hidden rounded-[20px] px-6 py-7 md:px-8"
        style={{
          background: [
            "radial-gradient(60% 80% at 90% 10%, rgba(120, 200, 130, 0.35), transparent 65%)",
            "linear-gradient(180deg, #14331f 0%, #0c2516 100%)",
          ].join(", "),
        }}
      >
        <p className="text-[12px] uppercase tracking-[0.16em] text-lime/70">
          Estimated business value
        </p>
        <p className="mt-2 text-[40px] font-medium leading-none tracking-tight text-lime md:text-[52px]">
          {formatCurrency(result.mid, result.currency)}
        </p>
        <p className="mt-2 text-[13px] text-white/70">
          Likely range {formatCurrency(result.low, result.currency)} –{" "}
          {formatCurrency(result.high, result.currency)}
        </p>
        <RangeBar low={result.low} mid={result.mid} high={result.high} />
      </div>

      {/* Metric cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Annual revenue" value={formatCurrency(result.annualRevenue, result.currency)} />
        <Metric label="Annual net profit" value={formatCurrency(result.annualNetProfit, result.currency)} />
        <Metric label="Net margin" value={`${Math.round(result.netMargin * 100)}%`} />
        <Metric label="Applied multiple" value={`${result.adjustedMultiple.toFixed(1)}×`} />
      </div>

      {/* Two-up: revenue trend + value drivers */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Revenue trend">
          <RevenueChart
            threeMonthsAgo={input.revenueThreeMonthsAgo ?? 0}
            lastMonth={input.revenueLastMonth ?? 0}
            currency={result.currency}
          />
        </Panel>
        <Panel title="What shaped the multiple">
          <MultipleBreakdown result={result} />
        </Panel>
      </div>

      {/* Inputs summary */}
      <Panel title="Information you provided" className="mt-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Field label="Years in operation" value={fmt(input.yearsInOperation)} />
          <Field label="Team size" value={fmt(input.teamSize)} />
          <Field label="Growth trend" value={input.growthTrend} />
          <Field label="Liabilities" value={input.liabilities != null ? formatCurrency(input.liabilities, result.currency) : null} />
          <Field label="Customers" value={input.customerSegments} />
          <Field label="Competitors" value={input.competitors} />
          <Field label="Market size" value={input.marketSize} />
          <Field label="Key assets" value={input.keyAssets} />
          <Field label="Major costs" value={input.costStructure} />
          <Field label="Key processes" value={input.keyProcesses} />
          <Field label="Biggest risks" value={input.risks} />
          <Field label="Growth strategy" value={input.growthStrategy} />
          <Field label="Contingency plan" value={input.contingencyPlans} />
        </dl>
      </Panel>

      <p className="mt-6 text-[11px] leading-relaxed text-ink/45">
        This is an automated, estimate-only valuation generated from the
        information provided during this demo. It is not financial advice or a
        formal appraisal. Accuracy depends on the accuracy of your inputs.
      </p>
    </div>
  );
}

function fmt(n: number | null): string | null {
  return n == null ? null : String(n);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[#fbfaf2] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className="mt-1 text-[18px] font-medium text-ink">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[18px] border border-ink/10 bg-white px-5 py-5 ${className}`}>
      <h3 className="text-[13px] font-medium text-ink">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="border-l-[3px] border-green/30 pl-3">
      <dt className="text-[11px] uppercase tracking-[0.1em] text-ink/45">{label}</dt>
      <dd className="mt-0.5 text-[13px] leading-snug text-ink/80">{value}</dd>
    </div>
  );
}

function RangeBar({ low, mid, high }: { low: number; mid: number; high: number }) {
  const span = high - low || 1;
  const midPct = ((mid - low) / span) * 100;
  return (
    <div className="mt-5">
      <div className="relative h-2 w-full rounded-full bg-white/15">
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime ring-4 ring-lime/25"
          style={{ left: `${midPct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/55">
        <span>{formatCurrency(low)}</span>
        <span>{formatCurrency(high)}</span>
      </div>
    </div>
  );
}

function RevenueChart({
  threeMonthsAgo,
  lastMonth,
  currency,
}: {
  threeMonthsAgo: number;
  lastMonth: number;
  currency: string;
}) {
  const max = Math.max(threeMonthsAgo, lastMonth, 1);
  const bars = [
    { label: "3 mo ago", value: threeMonthsAgo },
    { label: "Last mo", value: lastMonth },
  ];
  if (!threeMonthsAgo && !lastMonth) {
    return <p className="text-[12px] text-ink/45">No monthly figures provided.</p>;
  }
  return (
    <div className="flex h-40 items-end gap-6">
      {bars.map((b) => (
        <div key={b.label} className="flex flex-1 flex-col items-center justify-end">
          <span className="mb-1.5 text-[11px] font-medium text-ink/70">
            {formatCurrency(b.value, currency)}
          </span>
          <div
            className="w-full max-w-[64px] rounded-t-[8px] bg-green transition-all"
            style={{ height: `${Math.max(6, (b.value / max) * 110)}px` }}
          />
          <span className="mt-2 text-[11px] text-ink/50">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function MultipleBreakdown({ result }: { result: ValuationResult }) {
  return (
    <div className="space-y-2.5 text-[12.5px]">
      <Row label={`${result.industryLabel} base`} value={`${result.baseMultiple.toFixed(1)}×`} />
      {result.adjustments.map((a) => (
        <Row
          key={a.label}
          label={a.label}
          value={`${a.delta > 0 ? "+" : ""}${a.delta.toFixed(1)}×`}
          tone={a.delta > 0 ? "pos" : "neg"}
        />
      ))}
      <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-2.5 font-medium text-ink">
        <span>Applied multiple</span>
        <span>{result.adjustedMultiple.toFixed(1)}×</span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg";
}) {
  const color = tone === "pos" ? "text-green" : tone === "neg" ? "text-[#b4592f]" : "text-ink/70";
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink/65">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M8 2v8m0 0 3-3m-3 3L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 11.5V13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
