"use client";

import { useState } from "react";
import SilkArt from "./SilkArt";
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

  const name = input.businessName || "Your business";
  const money = (n: number) => formatCurrency(n, result.currency);

  return (
    <div className="mx-auto w-full max-w-[1080px] px-5 py-10 md:px-8 md:py-16">
      {/* Header */}
      <div className="playground-in flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[15px] text-ink/50">
            Valuation report · {new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 className="display mt-3 text-[42px] text-ink md:text-[60px]">{name}</h2>
          <p className="mt-2 text-[16px] text-ink/55">
            {result.industryLabel}
            {input.location ? ` · ${input.location}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-[8px] bg-ink/[0.06] px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-ink/[0.1]"
          >
            Start over
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-[8px] bg-green px-4 py-2.5 text-[14px] font-medium text-lime transition-colors hover:bg-green-mid disabled:opacity-60"
          >
            <DownloadIcon />
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Headline value on dark silk */}
      <div className="grain relative mt-10 overflow-hidden rounded-[8px] md:mt-12">
        <SilkArt mood="deep" />
        <div className="relative z-[2] grid grid-cols-1 gap-10 px-7 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:px-12 md:py-14">
          <div>
            <p className="text-[15px] text-cream/60">Estimated business value</p>
            <p className="display num mt-3 text-[64px] leading-none text-lime md:text-[88px]">
              {money(result.mid)}
            </p>
            <p className="mt-4 text-[16px] text-cream/65">
              Likely range {money(result.low)} – {money(result.high)}
            </p>
          </div>
          <RangeBar low={result.low} mid={result.mid} high={result.high} money={money} />
        </div>
      </div>

      {/* Key figures: hairline grid */}
      <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-[8px] border border-ink/10 bg-white/70 backdrop-blur-sm md:grid-cols-4">
        {[
          ["Annual revenue", money(result.annualRevenue)],
          ["Annual net profit", money(result.annualNetProfit)],
          ["Net margin", `${Math.round(result.netMargin * 100)}%`],
          ["Applied multiple", `${result.adjustedMultiple.toFixed(1)}×`],
        ].map(([k, v], i) => (
          <div
            key={k}
            className={`px-6 py-6 ${i % 2 === 1 ? "border-l border-ink/10" : ""} ${
              i >= 2 ? "border-t border-ink/10 md:border-t-0" : ""
            } ${i === 2 ? "md:border-l" : ""}`}
          >
            <dt className="text-[14px] text-ink/50">{k}</dt>
            <dd className="display num mt-2 text-[30px] leading-none text-ink md:text-[34px]">{v}</dd>
          </div>
        ))}
      </dl>

      {/* How we got there */}
      <div className="mt-16 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <div>
          <h3 className="display text-[32px] text-ink md:text-[40px]">How we got there</h3>
          <p className="mt-4 max-w-[36ch] text-[16px] leading-[1.6] text-ink/55">
            We start from the typical sale multiple for {result.industryLabel.toLowerCase()}, adjust
            for what makes your business different, then blend an earnings view with a revenue
            cross-check.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Row
            title={`${result.industryLabel} benchmark`}
            detail="Typical earnings multiple for this sector"
            value={`${result.baseMultiple.toFixed(1)}×`}
          />
          {result.adjustments.map((a) => (
            <Row
              key={a.label}
              title={a.label}
              detail={a.delta > 0 ? "Raises the multiple buyers will pay" : "Lowers the multiple buyers will pay"}
              value={`${a.delta > 0 ? "+" : "−"}${Math.abs(a.delta).toFixed(1)}×`}
              tone={a.delta > 0 ? "up" : "down"}
            />
          ))}
          <Row
            title="Earnings view"
            detail={`${money(result.annualNetProfit)} profit × ${result.adjustedMultiple.toFixed(1)}, weighted 70%`}
            value={money(result.earningsValue)}
          />
          <Row
            title="Revenue cross-check"
            detail={`${money(result.annualRevenue)} revenue × sector revenue multiple, weighted 30%`}
            value={money(result.revenueValue)}
          />
          {result.liabilities > 0 ? (
            <Row title="Less debt" detail="Outstanding liabilities you mentioned" value={`−${money(result.liabilities)}`} tone="down" />
          ) : null}
          <Row title="Estimated value" detail="Midpoint of your range" value={money(result.mid)} strong />
        </div>
      </div>

      {/* Revenue trend */}
      {input.revenueThreeMonthsAgo || input.revenueLastMonth ? (
        <div className="mt-16 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div>
            <h3 className="display text-[32px] text-ink md:text-[40px]">Revenue trend</h3>
            <p className="mt-4 max-w-[36ch] text-[16px] leading-[1.6] text-ink/55">
              Monthly revenue you shared, used to judge whether the business is growing, steady or
              declining.
            </p>
          </div>
          <div className="rounded-[8px] border border-ink/10 bg-white/70 p-6 backdrop-blur-sm md:p-8">
            <RevenueChart
              threeMonthsAgo={input.revenueThreeMonthsAgo ?? 0}
              lastMonth={input.revenueLastMonth ?? 0}
              money={money}
            />
          </div>
        </div>
      ) : null}

      {/* Inputs */}
      <div className="mt-16 md:mt-20">
        <h3 className="display text-[32px] text-ink md:text-[40px]">What you told us</h3>
        <dl className="mt-8 grid grid-cols-1 border-t border-ink/10 sm:grid-cols-2 sm:gap-x-12">
          <Field label="Years in operation" value={fmt(input.yearsInOperation)} />
          <Field label="Team size" value={fmt(input.teamSize)} />
          <Field label="Revenue trend" value={input.growthTrend ? TREND_LABEL[input.growthTrend] : null} />
          <Field label="Liabilities" value={input.liabilities != null ? money(input.liabilities) : null} />
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
      </div>

      <p className="mt-14 max-w-[70ch] text-[13px] leading-[1.6] text-ink/45">
        This is an automated, estimate-only valuation generated from the information provided during
        this demo. It is not financial advice or a formal appraisal. Accuracy depends on the accuracy
        of your inputs.
      </p>
    </div>
  );
}

const TREND_LABEL = { increasing: "Growing", steady: "Steady", decreasing: "Declining" } as const;

function fmt(n: number | null): string | null {
  return n == null ? null : String(n);
}

function Row({
  title,
  detail,
  value,
  tone,
  strong = false,
}: {
  title: string;
  detail: string;
  value: string;
  tone?: "up" | "down";
  strong?: boolean;
}) {
  return (
    <div
      className={`rounded-[12px] border px-5 py-4 ${
        strong ? "border-green/20 bg-[#eef6e6]" : "border-ink/[0.08] bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className={`text-[16px] text-ink ${strong ? "font-semibold" : "font-medium"}`}>{title}</p>
        <p
          className={`num shrink-0 text-[16px] font-medium ${
            tone === "up" ? "text-[#1d7a3a]" : tone === "down" ? "text-[#b4532a]" : "text-ink/70"
          } ${strong ? "!text-ink" : ""}`}
        >
          {value}
        </p>
      </div>
      <p className="mt-1 text-[14px] text-ink/50">{detail}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="border-b border-ink/10 py-4">
      <dt className="text-[14px] text-ink/45">{label}</dt>
      <dd className="mt-1 text-[16px] leading-[1.5] text-ink/85">{value}</dd>
    </div>
  );
}

function RangeBar({
  low,
  mid,
  high,
  money,
}: {
  low: number;
  mid: number;
  high: number;
  money: (n: number) => string;
}) {
  const span = high - low || 1;
  const midPct = ((mid - low) / span) * 100;
  return (
    <div>
      <div className="relative h-2 rounded-full bg-cream/15">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-lime/40 via-lime to-lime/40" />
        <div
          className="absolute -top-1.5 h-5 w-[3px] -translate-x-1/2 rounded-full bg-cream"
          style={{ left: `${midPct}%` }}
        />
      </div>
      <div className="num mt-3 flex justify-between text-[14px] text-cream/60">
        <span>Low {money(low)}</span>
        <span className="text-cream">Mid {money(mid)}</span>
        <span>High {money(high)}</span>
      </div>
    </div>
  );
}

function RevenueChart({
  threeMonthsAgo,
  lastMonth,
  money,
}: {
  threeMonthsAgo: number;
  lastMonth: number;
  money: (n: number) => string;
}) {
  const max = Math.max(threeMonthsAgo, lastMonth, 1) * 1.15;
  const bars = [
    { label: "Three months ago", value: threeMonthsAgo, color: "#e3dfd5" },
    { label: "Last month", value: lastMonth, color: "#2a9d4f" },
  ];
  const change = threeMonthsAgo ? (lastMonth - threeMonthsAgo) / threeMonthsAgo : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[14px] text-ink/50">Monthly revenue</p>
        {threeMonthsAgo && lastMonth ? (
          <p className={`num text-[14px] font-medium ${change >= 0 ? "text-[#1d7a3a]" : "text-[#b4532a]"}`}>
            {change >= 0 ? "+" : "−"}
            {Math.abs(Math.round(change * 100))}% over three months
          </p>
        ) : null}
      </div>
      <div className="mt-8 flex h-48 items-end justify-around gap-8 border-b border-ink/30">
        {bars.map((b) => (
          <div key={b.label} className="flex h-full w-full max-w-[120px] flex-col justify-end">
            <div
              className="bar-grow relative rounded-t-[3px]"
              style={{ height: `${Math.max(3, (b.value / max) * 100)}%`, background: b.color }}
            >
              <span className="num absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium text-ink">
                {money(b.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-around gap-8 pt-3">
        {bars.map((b) => (
          <span key={b.label} className="w-full max-w-[120px] text-center text-[14px] text-ink/60">
            {b.label}
          </span>
        ))}
      </div>
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
