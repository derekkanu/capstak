"use client";

import Link from "next/link";
import AppHeader from "../components/product/AppHeader";
import { Arrowhead, Lock, SarahAvatar, Tick } from "../components/product/Bits";
import BusinessChart, { ChartLegend } from "../components/product/BusinessChart";
import { openSarah } from "../components/product/SarahPanel";
import { confidenceLabel, valuate } from "../lib/capstack/engine";
import { explainNumbers, explainValue } from "../lib/capstack/explain";
import { nairaRange } from "../lib/capstack/format";
import { chapters, nextStep, shortDate, welcomeLine, type Chapter } from "../lib/capstack/sarah";
import { useOwnerFile } from "../lib/capstack/store";
import type { OwnerFile } from "../lib/capstack/types";

/* The owner's desk. Each part says one thing:
   - the top band: who you are and (once there's something to show) what it's worth and your numbers
   - Sarah: the single next step, and what it gives you
   - your file: every chapter once, with what it takes, what it gives, and the documents that back it */

export default function Dashboard() {
  const { file } = useOwnerFile();
  if (!file) return null;
  return (
    <>
      <div className="bg-[#ecebe2] px-5 pb-14 md:px-16">
        <AppHeader file={file} />
        {file.basics ? <Desk file={file} /> : <Welcome file={file} />}
      </div>
      <FileList file={file} />
    </>
  );
}

function Welcome({ file }: { file: OwnerFile }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-10">
      <div className="flex flex-[1_1_420px] flex-col gap-4">
        <h1 className="display m-0 text-[clamp(40px,4.4vw,64px)] font-normal leading-[1.02]">
          Welcome, <span className="text-[#7a857c]">{file.name}.</span>
        </h1>
        <p className="m-0 max-w-[38ch] text-[18px] leading-[1.5] text-[#3d4a42]">{welcomeLine(file.purpose)}</p>
      </div>
      <SarahCard file={file} />
    </div>
  );
}

function Desk({ file }: { file: OwnerFile }) {
  const v = valuate(file);
  const b = file.basics!;
  return (
    <div className="grid items-start gap-x-16 gap-y-10 md:grid-cols-[minmax(300px,1fr)_minmax(0,1.5fr)]">
      <section aria-labelledby="value-title" className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <h1 id="value-title" className="display m-0 text-[clamp(34px,3vw,44px)] font-normal leading-[1.08]">
            {b.businessName}
          </h1>
          {/* the small line says what the page shows: where things stand from the answers so far */}
          <span className="text-[15px] text-[#5d6a61]">So far, from what you&rsquo;ve told us</span>
        </div>
        {v.stage !== "none" && (
          <>
            <span className="mt-6 text-[14px] text-[#5d6a61]">{v.stage === "full" ? "What it's worth today" : "A first look at what it's worth"}</span>
            <p className="m-0 whitespace-nowrap text-[clamp(40px,4.2vw,68px)] font-light leading-none tracking-[-0.05em]">{nairaRange(v.low, v.high)}</p>
            <span className="text-[14px] text-[#5d6a61]">
              How sure we are: <span className="font-medium text-ink">{confidenceLabel(v.confidence).toLowerCase()}</span>
              {v.stage === "first-look" ? ", for now" : ` · ${v.confidence}%`}
            </span>
            <p className="m-0 mt-1 max-w-[42ch] text-[14px] leading-[1.55] text-[#3d4a42]">{explainValue(file)}</p>
          </>
        )}
      </section>

      <section aria-labelledby="chart-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="chart-title" className="m-0 text-[24px] font-normal tracking-[-0.02em]">
            Your business in numbers
          </h2>
          {file.numbers && <ChartLegend />}
        </div>
        {file.numbers ? (
          <>
            <BusinessChart numbers={file.numbers} />
            <p className="m-0 max-w-[60ch] text-[14px] leading-[1.55] text-[#3d4a42]">{explainNumbers(file)}</p>
          </>
        ) : (
          // after the basics, the chart's place waits for the sales and costs that fill it
          <div className="relative flex h-[230px] flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#c9ccc0] text-center">
            <span className="text-[16px]">Your sales and costs will show here</span>
            <span className="max-w-[36ch] text-[14px] text-[#5d6a61]">Month by month, with what&rsquo;s left for you, what you own and what you owe.</span>
            <Link href="/app/file/numbers" className="mt-1 inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-cream no-underline">
              Add them · about 3 min
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function SarahCard({ file }: { file: OwnerFile }) {
  const step = nextStep(file);
  return (
    <section
      aria-labelledby="sarah-title"
      className="flex max-w-[520px] flex-[1_1_380px] flex-col gap-4 rounded-[20px] bg-cream-soft p-6 shadow-[0_24px_48px_-32px_rgba(15,27,20,0.35)] md:p-7"
    >
      <div className="flex items-center gap-3">
        <SarahAvatar />
        <span className="flex flex-col">
          <span id="sarah-title" className="text-[15px] font-medium">
            Sarah
          </span>
          <span className="text-[12px] text-[#5d6a61]">Your guide</span>
        </span>
      </div>
      <p className="m-0 text-[18px] leading-[1.5]">{step.message}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href={step.href} className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-[15px] font-medium text-cream no-underline hover:bg-green">
          {step.cta}
          <Arrowhead className="h-[11px] w-[11px] rotate-180 text-lime" />
        </Link>
        <button type="button" onClick={openSarah} className="min-h-11 text-[14px] text-[#3d4a42] underline">
          Ask her something
        </button>
      </div>
    </section>
  );
}

function FileList({ file }: { file: OwnerFile }) {
  const list = chapters(file);
  const done = list.filter((c) => c.key !== "report" && c.status === "done").length;
  const next = nextStep(file).key;
  return (
    <section aria-labelledby="file-title" className="flex flex-col px-5 pb-16 pt-12 md:px-16">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="file-title" className="m-0 text-[28px] font-normal tracking-[-0.02em]">
          Your file
        </h2>
        <span className="text-[14px] text-[#5d6a61]">
          {done === 3 ? "All done. Update anything that changes, so your value stays current." : done ? `${done} of 3 chapters done` : "Do them in any order. Everything saves as you go."}
        </span>
      </div>
      <ul className="m-0 list-none border-b border-[#e3e4dc] p-0">
        {list.map((c) => (
          <li key={c.key} className="border-t border-[#e3e4dc]">
            <Row c={c} isNext={c.key === next || ((next === "bank" || next === "refresh") && c.key === "numbers")} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Row({ c, isNext }: { c: Chapter; isNext: boolean }) {
  const locked = c.status === "locked";
  const body = (
    <>
      <span className={`text-[28px] font-light ${c.status === "todo" && !isNext ? "text-[#9aa39b]" : ""}`}>
        {c.no || <Lock className="h-[22px] w-[22px] text-[#9aa39b]" />}
      </span>
      <span className="flex flex-col gap-1">
        <span className={`text-[18px] font-medium ${locked ? "text-[#5d6a61]" : ""}`}>{c.title}</span>
        <span className={`text-[14px] ${locked ? "text-[#9aa39b]" : "text-[#5d6a61]"}`}>{c.detail ?? c.covers}</span>
      </span>
      <span className={`text-[14px] ${locked ? "text-[#9aa39b]" : "text-[#3d4a42]"}`}>{c.gives}</span>
      <span className="justify-self-start md:justify-self-end">
        {c.status === "done" && c.key !== "report" ? (
          // a finished chapter stays live: the owner updates it as the business changes
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#5d6a61]">
              <Tick className="h-3.5 w-3.5 text-seal" />
              {c.updatedAt ? `Updated ${shortDate(c.updatedAt)}` : "Done"}
            </span>
            <span className={`inline-flex min-h-9 items-center rounded-full px-4 text-[13px] font-medium ${isNext ? "bg-lime" : "bg-[#ecebe2]"}`}>Update</span>
          </span>
        ) : c.key === "report" && c.status === "done" ? (
          <span className="inline-flex min-h-9 items-center rounded-full bg-lime px-4 text-[13px] font-medium">Open report</span>
        ) : locked ? null : isNext ? (
          <span className="inline-flex min-h-9 items-center rounded-full bg-lime px-4 text-[13px] font-medium">
            {c.status === "started" ? "Carry on" : "Start"} · {c.minutes} min
          </span>
        ) : (
          <span className="text-[13px] text-[#5d6a61]">{c.status === "started" ? "Carry on" : `${c.minutes} min`}</span>
        )}
      </span>
    </>
  );
  const grid = "grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-5 gap-y-2 py-5 md:grid-cols-[56px_minmax(0,2fr)_minmax(0,2fr)_190px] [&>*:nth-child(n+3)]:col-start-2 md:[&>*:nth-child(n+3)]:col-start-auto";
  return locked ? (
    <div className={grid}>{body}</div>
  ) : (
    <Link href={c.href} className={`${grid} text-ink no-underline transition-colors hover:bg-[#f3f3ed]`}>
      {body}
    </Link>
  );
}
