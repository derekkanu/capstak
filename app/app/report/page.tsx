"use client";

import Link from "next/link";
import AppHeader from "../../components/product/AppHeader";
import { Arrowhead, Lock, SarahAvatar } from "../../components/product/Bits";
import BusinessChart, { ChartLegend } from "../../components/product/BusinessChart";
import SarahsReport from "../../components/product/SarahsReport";
import { boosts, confidenceLabel, sectorOf, valuate } from "../../lib/capstack/engine";
import { naira, nairaRange } from "../../lib/capstack/format";
import { MODEL, showAnswer } from "../../lib/capstack/questions";
import { audience, chapters } from "../../lib/capstack/sarah";
import { useOwnerFile } from "../../lib/capstack/store";
import type { OwnerFile } from "../../lib/capstack/types";

/* The report: what the business is worth, how sure we are, and every reason, laid out so an owner understands
   it and a buyer, lender or broker can check it. It opens once chapters 01 to 03 are done. */

export default function ReportPage() {
  const { file } = useOwnerFile();
  if (!file) return null;
  const ready = chapters(file).find((c) => c.key === "report")?.status === "done";
  return (
    <>
      <div className="bg-[#ecebe2] px-5 md:px-16 print:bg-transparent">
        <AppHeader file={file} />
      </div>
      {ready ? (
        <Report file={file} />
      ) : (
        <>
          <Locked file={file} />
          {/* Sarah's findings don't wait for the full report: they start once the numbers are in */}
          <div className="pb-20">
            <SarahsReport file={file} />
          </div>
        </>
      )}
    </>
  );
}

function Locked({ file }: { file: OwnerFile }) {
  const left = chapters(file).filter((c) => c.key !== "report" && c.status !== "done");
  return (
    <div className="bg-[#ecebe2] px-5 pb-16 md:px-16">
      <div className="flex max-w-[640px] flex-col gap-5 pt-4">
        <Lock className="h-8 w-8 text-[#7a857c]" />
        <h1 className="display m-0 text-[clamp(36px,4vw,52px)] font-normal leading-[1.05]">Your report opens when your file is done</h1>
        <p className="m-0 text-[17px] leading-[1.55] text-[#3d4a42]">
          It needs all three chapters, so what it says is something {audience(file.purpose)} can rely on. Still to do:
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {left.map((c) => (
            <li key={c.key}>
              <Link href={c.href} className="flex items-center justify-between gap-4 rounded-[14px] bg-cream-soft px-5 py-4 text-ink no-underline hover:bg-white">
                <span>
                  <span className="mr-3 font-light text-[#7a857c]">{c.no}</span>
                  {c.title}
                </span>
                <span className="text-[13px] text-[#5d6a61]">{c.status === "started" ? "Carry on" : `${c.minutes} min`}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Report({ file }: { file: OwnerFile }) {
  const v = valuate(file);
  if (v.stage !== "full") return null;
  const b = file.basics!;
  const n = file.numbers!;
  const date = new Date(file.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const used = v.methods.filter((m) => m.used);
  const totalWeight = used.reduce((t, m) => t + m.weight, 0);
  const more = boosts(file);

  return (
    <article className="pb-20">
      {/* the answer */}
      <section className="bg-[#ecebe2] px-5 pb-14 md:px-16 print:bg-transparent">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-8">
          <div className="flex flex-[1_1_520px] flex-col gap-4">
            <span className="text-[14px] text-[#5d6a61]">{date}</span>
            <h1 className="display m-0 text-[clamp(34px,3.4vw,48px)] font-normal leading-[1.06]">
              What {b.businessName} is worth
            </h1>
            <p className="m-0 whitespace-nowrap text-[clamp(48px,6vw,96px)] font-light leading-none tracking-[-0.05em]">{nairaRange(v.low, v.high)}</p>
            <p className="m-0 text-[16px] text-[#3d4a42]">
              Most likely about <span className="font-medium text-ink">{naira(v.mid)}</span>. After paying what the business owes and adding its cash,
              you&rsquo;d keep about <span className="font-medium text-ink">{naira(v.afterDebts)}</span>.
            </p>
          </div>
          <div className="flex flex-[1_1_300px] flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] text-[#5d6a61]">How sure we are</span>
              <span className="text-[18px] font-medium">
                {confidenceLabel(v.confidence)} · {v.confidence}%
              </span>
            </div>
            <div aria-hidden className="h-2 overflow-hidden rounded-full bg-[#d7d9cd]">
              <div className="h-full rounded-full bg-ink" style={{ width: `${v.confidence}%` }} />
            </div>
            <p className="m-0 text-[14px] leading-[1.5] text-[#5d6a61]">
              The range is ±{Math.round((v.high / v.mid - 1) * 100)}%. It narrows as your answers are backed up by documents.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 print:hidden">
              <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-cream">
                Save as PDF
              </button>
              <Link href="/app/documents" className="inline-flex min-h-11 items-center rounded-full bg-cream-soft px-5 text-[14px] text-ink no-underline">
                Make it surer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* how we worked it out */}
      <section aria-labelledby="how-title" className="px-5 pt-14 md:px-16">
        <h2 id="how-title" className="m-0 mb-2 text-[28px] font-normal tracking-[-0.02em]">
          How we worked it out
        </h2>
        <p className="m-0 mb-6 max-w-[62ch] text-[15px] leading-[1.55] text-[#5d6a61]">
          We use each method that has enough to stand on, and blend them. The same answers always give the same result: the rules are fixed and written
          down.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {v.methods.map((m) => (
            <div key={m.key} className={`flex flex-col gap-3 rounded-[16px] p-6 ${m.used ? "bg-[#f3f3ed]" : "border border-dashed border-[#d7d9cd]"}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[16px] font-medium">{m.label}</span>
                <span className="text-[13px] text-[#5d6a61]">{m.used ? `${Math.round((m.weight / totalWeight) * 100)}% of the blend` : "Not used"}</span>
              </div>
              <span className={`text-[34px] font-light tracking-[-0.03em] ${m.used ? "" : "text-[#9aa39b]"}`}>{m.used ? naira(m.value) : "–"}</span>
              <span className="text-[14px] leading-[1.5] text-[#3d4a42]">{m.what}</span>
              <span className="text-[13px] leading-[1.5] text-[#5d6a61]">{m.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* what moved the price */}
      <section aria-labelledby="moved-title" className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-14 gap-y-10 px-5 pt-14 md:px-16">
        <div className="flex flex-col">
          <h2 id="moved-title" className="m-0 mb-2 text-[28px] font-normal tracking-[-0.02em]">
            What moved the price
          </h2>
          <p className="m-0 mb-4 text-[15px] leading-[1.55] text-[#5d6a61]">
            Buyers of {sectorOf(b.sector).label.toLowerCase()} businesses start at about {sectorOf(b.sector).multiple.toFixed(1)} years of what&rsquo;s left for the owner.
            These moved it to {v.multiple.toFixed(1)}:
          </p>
          <ul className="m-0 list-none p-0">
            {v.reasons.map((r) => (
              <li key={r.label} className="flex items-start justify-between gap-4 border-t border-[#e3e4dc] py-3.5">
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px]">{r.label}</span>
                  <span className="text-[13px] text-[#5d6a61]">{r.why}</span>
                </span>
                <span className={`shrink-0 font-mono text-[14px] ${r.delta > 0 ? "text-[#1f7a3a]" : "text-[#a33a12]"}`}>
                  {r.delta > 0 ? "+" : "−"}
                  {Math.abs(r.delta).toFixed(1)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 border-t-2 border-ink py-3.5">
              <span className="text-[15px] font-medium">Years of earnings a buyer would pay</span>
              <span className="font-mono text-[15px] font-medium">{v.multiple.toFixed(1)}</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-[28px] font-normal tracking-[-0.02em]">Your business in numbers</h2>
            <ChartLegend />
          </div>
          <BusinessChart numbers={n} />
          <p className="m-0 text-[14px] leading-[1.55] text-[#5d6a61]">
            {naira(v.yearlySales)} of sales a year, {naira(v.yearlyLeft)} left for you before paying yourself.{" "}
            {n.estimated?.some((id) => id === "lastMonthCosts" || id === "fixedCosts") ? "Your costs are our estimate for your trade. " : ""}
            {v.trend === "growing" ? "Sales are growing faster than prices." : v.trend === "shrinking" ? "Sales have been falling." : "Sales are holding steady."}
          </p>
        </div>
      </section>

      {/* how it makes money: the one-page picture */}
      <section aria-labelledby="model-title" className="px-5 pt-14 md:px-16">
        <h2 id="model-title" className="m-0 mb-6 text-[28px] font-normal tracking-[-0.02em]">
          How {b.businessName} makes money
        </h2>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-px overflow-hidden rounded-[16px] bg-[#e3e4dc]">
          <div className="flex flex-col gap-1 bg-cream-soft p-5">
            <dt className="text-[13px] text-[#5d6a61]">The business</dt>
            <dd className="m-0 text-[15px]">
              {sectorOf(b.sector).label} in {b.city}, {b.people} {b.people === 1 ? "person" : "people"}
            </dd>
          </div>
          {MODEL.map((q) => (
            <div key={q.id} className="flex flex-col gap-1 bg-cream-soft p-5">
              <dt className="text-[13px] text-[#5d6a61]">{q.prompt}</dt>
              <dd className="m-0 text-[15px]">{showAnswer(q, file.model[q.id as keyof typeof file.model])}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* what would make it surer */}
      {more.length > 0 && (
        <section aria-labelledby="surer-title" className="px-5 pt-14 md:px-16 print:hidden">
          <div className="flex max-w-[760px] items-start gap-4">
            <SarahAvatar />
            <div className="flex flex-1 flex-col gap-3">
              <h2 id="surer-title" className="m-0 text-[24px] font-normal tracking-[-0.02em]">
                Want it surer?
              </h2>
              <ul className="m-0 list-none p-0">
                {more.map((x) => (
                  <li key={x.key} className="border-t border-[#e3e4dc]">
                    <Link href={x.href} className="flex items-center justify-between gap-4 py-3.5 text-ink no-underline hover:bg-[#f3f3ed]">
                      <span className="text-[15px]">{x.label}</span>
                      <span className="flex items-center gap-2 font-mono text-[13px] text-[#1f7a3a]">
                        +{x.gain}% sure
                        <Arrowhead className="h-2.5 w-2.5 rotate-180 text-ink" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <SarahsReport file={file} />

      <p className="m-0 mt-14 max-w-[80ch] px-5 text-[12px] leading-[1.6] text-[#7a857c] md:px-16">
        An estimate from the answers and documents in this file, worked out with fixed rules: what similar businesses sell for (small-business sale data,
        adjusted for Nigeria), what it should earn from here (at a return built from Nigerian government bond yields plus the risk of a small business),
        and what it owns. It is not a formal valuation or financial advice.
      </p>
    </article>
  );
}
