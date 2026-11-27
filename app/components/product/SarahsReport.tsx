"use client";

import { useEffect, useState } from "react";
import { insightsFor, simulatedSummary, type Insight } from "../../lib/capstack/insights";
import { updateFile } from "../../lib/capstack/store";
import type { OwnerFile } from "../../lib/capstack/types";
import { SarahAvatar } from "./Bits";

/* "Sarah's report": what Sarah noticed about the business, kept apart from the value and labelled as AI. A short
   summary shows first; the findings open underneath. Opening the report counts as seeing them, which clears the
   notification bar. */

const KIND = {
  strength: { label: "Strength", tone: "bg-[#e3f1e4] text-[#1a6b33]" },
  risk: { label: "Watch out", tone: "bg-[#fbe9df] text-[#a33a12]" },
  tip: { label: "Tip", tone: "bg-[#ecebe2] text-[#3d4a42]" },
} as const;

export default function SarahsReport({ file }: { file: OwnerFile }) {
  const rules = insightsFor(file);
  const [ai, setAi] = useState<{ key: string; summary: string; source: string } | null>(null);
  const key = file.updatedAt;

  // the summary is worded by whichever brain is on; the rules' own wording shows until (or unless) it arrives
  useEffect(() => {
    if (!rules.length) return;
    let gone = false;
    fetch("/api/sarah", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ task: "insights", file }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((r: { summary: string; source: string } | null) => {
        if (!gone && r) setAi({ key, summary: r.summary, source: r.source });
      })
      .catch(() => {});
    return () => {
      gone = true;
    };
    // re-ask only when the file changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // seeing the report clears Sarah's notifications
  const ids = rules.map((i) => i.id).join(",");
  useEffect(() => {
    if (!ids) return;
    const seen = new Set(file.seenInsights ?? []);
    if (ids.split(",").some((id) => !seen.has(id))) updateFile((f) => ({ ...f, seenInsights: Array.from(new Set([...(f.seenInsights ?? []), ...ids.split(",")])) }));
  }, [ids, file.seenInsights]);

  if (!rules.length) return null;
  const summary = ai && ai.key === key ? ai.summary : simulatedSummary(file, rules);

  return (
    <section id="sarah" aria-labelledby="sarahs-report-title" className="scroll-mt-6 px-5 pt-14 md:px-16">
      <div className="flex max-w-[860px] flex-col gap-4 rounded-[20px] bg-[#f3f3ed] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <SarahAvatar size={44} />
          <h2 id="sarahs-report-title" className="m-0 text-[24px] font-normal tracking-[-0.02em]">
            Sarah&rsquo;s report
          </h2>
          <span className="rounded-full bg-white px-3 py-1 text-[12px] text-[#5d6a61]">Written by AI</span>
        </div>
        <p className="m-0 max-w-[62ch] text-[16px] leading-[1.6]">{summary}</p>
        <details className="group">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-[14px] font-medium [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">See all {rules.length} findings</span>
            <span className="hidden group-open:inline">Hide the findings</span>
            <span aria-hidden className="transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <ul className="m-0 mt-2 flex list-none flex-col gap-3 p-0">
            {rules.map((i: Insight) => (
              <li key={i.id} className="flex flex-col gap-1.5 rounded-[14px] bg-white p-4">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${KIND[i.kind].tone}`}>{KIND[i.kind].label}</span>
                  <span className="text-[15px] font-medium">{i.title}</span>
                </span>
                <span className="text-[14px] leading-[1.55] text-[#3d4a42]">{i.body}</span>
              </li>
            ))}
          </ul>
        </details>
        <p className="m-0 text-[12px] leading-[1.5] text-[#7a857c]">
          Sarah&rsquo;s report is written by AI from your answers and the usual figures for your trade, so it can be wrong. The value at the top of your report
          isn&rsquo;t: it comes from fixed rules.
        </p>
      </div>
    </section>
  );
}
