"use client";

import { useEffect, useState } from "react";
import { Seal } from "./FilePieces";

/* The documents that pass through the hero's file, one at a time. Each one slides in from the paper trail
   on the left, drops into the folder, pops back up and sits for a moment (it gets stamped), then slides
   out to the right to rejoin the trail, and the next one comes in. One CSS keyframe run per document
   (globals.css: docCycle / docStamp); the key change restarts it. Figures are illustrations. */

const CYCLE_MS = 6200;

type Kind = "report" | "pos" | "statement" | "form" | "polaroid" | "invoice" | "note";
const ORDER: Kind[] = ["report", "pos", "form", "statement", "polaroid", "invoice", "note"];

const card = "shadow-[0_12px_26px_-16px_rgba(0,0,0,0.5)]";

function Doc({ kind }: { kind: Kind }) {
  switch (kind) {
    case "report":
      return (
        <div className={`relative grid aspect-[1/1.3] w-full content-start gap-1.5 rounded-[3px] bg-white p-3.5 ${card}`}>
          <span className="tab-label !text-[8px] text-ink/50">Valuation report · File №0142</span>
          <b className="text-[17px] font-semibold leading-tight tracking-[-0.02em]">Okafor Woodworks</b>
          <span className="h-[5px] rounded bg-[#ecebe5]" />
          <span className="h-[5px] w-[70%] rounded bg-[#ecebe5]" />
          <span className="num mt-1 font-mono text-[17px] font-medium text-green">₦24M – ₦35M</span>
          <Seal id="cycle" className="doc-stamp absolute bottom-3 right-3 h-16 w-16 text-seal" />
        </div>
      );
    case "pos":
      return (
        <div className={`receipt relative w-[78%] px-3 pb-5 pt-3 font-mono text-[11px] leading-[1.8] text-ink ${card}`}>
          <div className="mb-1 border-b border-dashed border-ink/25 pb-1 text-center font-semibold tracking-[0.12em]">POS · MAY</div>
          <div className="flex justify-between"><span>SALES</span><span>₦3.5M</span></div>
          <div className="flex justify-between"><span>COSTS</span><span>₦2.6M</span></div>
          <div className="flex justify-between"><span>LEFT</span><span>₦890k</span></div>
          <div className="mt-1 border-t border-dashed border-ink/25 pt-1 text-center text-[9px] text-ink/50">THANK YOU</div>
          <span className="doc-stamp absolute -right-2 top-6 rotate-[-12deg] rounded-[3px] border-2 border-seal px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-seal">FILED</span>
        </div>
      );
    case "form":
      return (
        <div className={`relative w-full rounded-[2px] bg-[#f6efe2] px-3 pb-3 pt-4 font-mono text-[9.5px] text-ink ${card}`}>
          <span aria-hidden className="absolute inset-x-0 top-0 h-2 bg-[radial-gradient(circle_at_6px_0,transparent_4px,#f6efe2_4.5px)] bg-[length:12px_8px]" />
          {[
            ["BUSINESS", "OKAFOR WOODWORKS"],
            ["TRADE", "FURNITURE"],
            ["CITY", "ABA, ABIA"],
            ["TRADING", "6 YEARS"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[62px_1fr] border border-b-0 border-ink/40 last:border-b">
              <span className="border-r border-ink/40 px-1.5 py-1.5 text-[7px] tracking-[0.08em] text-ink/55">{k}</span>
              <span className="px-1.5 py-1.5 font-medium">{v}</span>
            </div>
          ))}
          <span className="doc-stamp absolute -right-3 -top-3 rotate-[10deg] rounded-full bg-pop px-2 py-1 text-[9px] font-semibold text-white">PROFILE</span>
        </div>
      );
    case "statement":
      return (
        <div className={`relative grid aspect-[1/1.3] w-full content-start gap-1.5 rounded-[2px] bg-white p-3 ${card}`}>
          <span className="font-mono text-[8px] font-medium tracking-[0.1em] text-ink/50">BANK STATEMENT · APR</span>
          {Array.from({ length: 8 }, (_, k) => (
            <span key={k} className="flex justify-between gap-2">
              <span className="h-[4px] flex-1 rounded bg-[#ecebe5]" />
              <span className="h-[4px] w-[22%] rounded bg-[#dfe6dc]" />
            </span>
          ))}
          <span className="mt-1 font-mono text-[11px] font-medium text-green">₦12.4M in · ₦9.1M out</span>
          <span className="doc-stamp absolute bottom-3 right-3 rotate-[-10deg] rounded-[3px] border-2 border-seal px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-seal">VERIFIED</span>
        </div>
      );
    case "polaroid":
      return (
        <div className={`relative w-[86%] bg-white p-2 pb-7 ${card}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/maker.jpg" alt="" className="aspect-square w-full object-cover object-[60%_20%]" />
          <span className="absolute bottom-2 left-2 font-mono text-[9px] text-ink/60">The workshop · Aba</span>
        </div>
      );
    case "invoice":
      return (
        <div className={`relative w-[86%] rounded-[2px] bg-white p-3 ${card}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-green">Invoice</span>
            <span className="font-mono text-[9px] text-ink/45">#0087</span>
          </div>
          <p className="mt-1 text-[10px] text-ink/55">Lekki Hotels Ltd · 40 chairs</p>
          <span className="mt-2 block h-[4px] w-[80%] rounded bg-[#ecebe5]" />
          <span className="mt-1 block h-[4px] w-[60%] rounded bg-[#ecebe5]" />
          <div className="mt-2 flex justify-between border-t border-ink/10 pt-1.5 font-mono text-[11px] text-ink">
            <span>TOTAL</span>
            <span>₦640,000</span>
          </div>
          <span className="doc-stamp absolute -right-2 -top-2 rotate-[8deg] rounded-[3px] bg-green px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.1em] text-lime">PAID</span>
        </div>
      );
    case "note":
      return (
        <div className={`w-[74%] bg-[#f4e98a] p-3 text-[13px] leading-snug text-ink/80 ${card}`}>
          Lekki Hotels wants 60 more chairs in March.
          <span className="mt-2 block font-mono text-[9px] text-ink/50">REPEAT CUSTOMER</span>
        </div>
      );
  }
}

export default function DocCycle({ startAfter = 4400 }: { startAfter?: number }) {
  const [i, setI] = useState(-1); // -1: not started yet

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tick: number | undefined;
    const start = window.setTimeout(() => {
      setI(0);
      if (!reduce) tick = window.setInterval(() => setI((n) => n + 1), CYCLE_MS);
    }, reduce ? 0 : startAfter);
    return () => {
      window.clearTimeout(start);
      if (tick) window.clearInterval(tick);
    };
  }, [startAfter]);

  if (i < 0) return null;
  const kind = ORDER[i % ORDER.length];
  return (
    <div key={i} className="doc-cycle absolute right-[8%] top-[24%] flex w-[44%] justify-center" style={{ animationDuration: `${CYCLE_MS}ms` }}>
      <Doc kind={kind} />
    </div>
  );
}
