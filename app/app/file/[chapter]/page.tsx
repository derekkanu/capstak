"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChoiceAnswer,
  MoneyField,
  MonthsAnswer,
  MultiAnswer,
  NumberAnswer,
  TextAnswer,
  UploadAnswer,
} from "../../../components/product/AnswerInputs";
import { Arrowhead, SarahAvatar } from "../../../components/product/Bits";
import { openSarah } from "../../../components/product/SarahPanel";
import { confidenceLabel, valuate } from "../../../lib/capstack/engine";
import { naira, nairaRange } from "../../../lib/capstack/format";
import { CHAPTERS, forBusiness, type ChapterKey, type Question } from "../../../lib/capstack/questions";
import { audience } from "../../../lib/capstack/sarah";
import { suggestFor } from "../../../lib/capstack/suggest";
import { updateFile, useOwnerFile } from "../../../lib/capstack/store";
import type { Basics, Model, Numbers, OwnerFile } from "../../../lib/capstack/types";

/* One chapter, full screen: one question at a time, Sarah reacting as you go, Back to change an answer, and
   "What do you mean?" under every question. Basics and numbers are saved when the chapter ends; the
   business-model answers save one by one, so stopping halfway keeps them. */

type Answers = Record<string, unknown>;

function startingAnswers(key: ChapterKey, f: OwnerFile): Answers {
  if (key === "basics") return { ...(f.basics ?? {}) };
  if (key === "numbers") return f.numbers ? { ...f.numbers } : { months: Array(6).fill(undefined) };
  return { ...f.model };
}

function answered(q: Question, a: unknown) {
  if (q.optional) return true;
  if (q.kind === "months") return Array.isArray(a) && a.length === 6 && a.every((x) => typeof x === "number");
  if (q.kind === "multi") return Array.isArray(a) && a.length > 0;
  if (q.kind === "text") return typeof a === "string" && a.trim().length > 0;
  if (q.kind === "number") return typeof a === "number" && a > 0;
  if (q.kind === "money") return typeof a === "number";
  return a !== undefined && a !== null && a !== "";
}

export default function ChapterPage() {
  const params = useParams<{ chapter: string }>();
  const key = params.chapter as ChapterKey;
  const chapter = CHAPTERS[key];
  const { file } = useOwnerFile();
  const router = useRouter();

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [help, setHelp] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const answerBox = useRef<HTMLDivElement>(null);

  // each new question puts the cursor in its field, so typing and Enter work straight away
  useEffect(() => {
    answerBox.current?.querySelector<HTMLInputElement>("input:not([type=file])")?.focus();
  }, [i]);

  // answers start from what's already in the file, so reopening a chapter is a review
  const current = useMemo(() => answers ?? (file && chapter ? startingAnswers(key, file) : {}), [answers, file, key, chapter]);

  if (!chapter)
    return (
      <main className="flex min-h-svh items-center justify-center bg-cream-soft">
        <Link href="/app">That chapter doesn&rsquo;t exist. Back to your desk</Link>
      </main>
    );
  if (!file) return null;
  if (finished) return <Finished chapterKey={key} file={file} />;

  const qs = chapter.questions;
  const q = forBusiness(qs[i], file.basics);
  const value = current[q.id];
  const ok = answered(q, value);
  // where earlier answers can work this one out, offer it: owners shouldn't need an accountant to answer
  const suggestion = suggestFor(q.id, { basics: file.basics, answers: current });

  const set = (v: unknown) => {
    const next = { ...current, [q.id]: v };
    setAnswers(next);
    // the business-model answers save as they're given
    if (key === "model")
      updateFile((f) => ({ ...f, model: { ...f.model, [q.id]: v } as Model, chapterUpdatedAt: { ...f.chapterUpdatedAt, model: new Date().toISOString() } }));
  };

  function next(given: Answers = current) {
    const a = given[q.id];
    if (!answered(q, a)) return;
    setHelp(false);
    setReaction(q.react ? q.react(a) : null);
    if (i < qs.length - 1) {
      setI(i + 1);
      return;
    }
    const stamp = (f: OwnerFile) => ({ ...f.chapterUpdatedAt, [key]: new Date().toISOString() });
    if (key === "basics") updateFile((f) => ({ ...f, basics: given as unknown as Basics, chapterUpdatedAt: stamp(f) }));
    if (key === "numbers") {
      const n = given as Record<string, unknown>;
      const numbers: Numbers = {
        months: (n.months as number[]).map(Number),
        lastMonthCosts: Number(n.lastMonthCosts ?? 0),
        fixedCosts: Number(n.fixedCosts ?? 0),
        lastYearSales: typeof n.lastYearSales === "number" && n.lastYearSales > 0 ? n.lastYearSales : null,
        equipment: Number(n.equipment ?? 0),
        stock: Number(n.stock ?? 0),
        cash: Number(n.cash ?? 0),
        owed: Number(n.owed ?? 0),
        records: (n.records as Numbers["records"]) ?? "some",
      };
      updateFile((f) => ({ ...f, numbers, chapterUpdatedAt: stamp(f) }));
    }
    setFinished(true);
  }

  const progress = ((i + (ok ? 1 : 0)) / qs.length) * 100;

  return (
    <main className="flex min-h-svh flex-col bg-cream-soft">
      <div className="h-1 bg-[#ecebe2]" aria-hidden>
        <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-10">
        <Link href="/app" className="text-[14px] text-[#3d4a42]">
          ← Back to your desk
        </Link>
        <span className="flex items-center gap-5">
          <span className="hidden text-[14px] text-[#5d6a61] sm:inline">
            {chapter.title}, {i + 1} of {qs.length}
          </span>
          <button type="button" onClick={openSarah} className="min-h-11 rounded-full bg-[#ecebe2] px-4 text-[14px] hover:bg-[#e0e0d6]">
            Ask Sarah
          </button>
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-7 px-5 pb-16 pt-[6vh]">
        <div className="flex items-center gap-3">
          <SarahAvatar size={44} />
          <p className="m-0 flex flex-col text-[15px] leading-[1.5] text-[#3d4a42]" aria-live="polite">
            <span className="font-medium text-ink">Sarah</span>
            {(reaction ?? (i === 0 ? openingLine(key, file) : null)) && <span>{reaction ?? openingLine(key, file)}</span>}
          </p>
        </div>

        <h1 key={q.id} className="display m-0 animate-[cardSettle_500ms_cubic-bezier(0.22,1,0.36,1)_both] text-[clamp(28px,4vw,40px)] font-normal leading-[1.12]">
          {q.prompt}
        </h1>

        <div ref={answerBox}>
          {q.kind === "text" && <TextAnswer q={q} value={(value as string) ?? ""} onChange={set} onEnter={() => next()} />}
          {q.kind === "number" && <NumberAnswer q={q} value={value as number | undefined} onChange={set} onEnter={() => next()} />}
          {q.kind === "money" && (
            <div className="flex flex-col gap-3">
              <MoneyField autoFocus value={value as number | undefined} onChange={set} onEnter={() => next()} label={q.prompt} placeholder={q.placeholder} />
              {q.none && (
                <button
                  type="button"
                  onClick={() => {
                    set(0);
                    next({ ...current, [q.id]: 0 });
                  }}
                  className={`min-h-11 self-start rounded-full px-4 text-[14px] ${value === 0 ? "bg-ink text-cream" : "bg-[#ecebe2] hover:bg-[#e0e0d6]"}`}
                >
                  {q.none}
                </button>
              )}
            </div>
          )}
          {q.kind === "months" && <MonthsAnswer value={(value as (number | undefined)[]) ?? Array(6).fill(undefined)} onChange={set} />}
          {q.kind === "choice" && (
            <ChoiceAnswer
              q={q}
              value={value}
              onPick={(v) => {
                set(v);
                // a picked choice moves on by itself, after a beat so the choice is seen
                const given = { ...current, [q.id]: v };
                window.setTimeout(() => next(given), 220);
              }}
            />
          )}
          {q.kind === "multi" && <MultiAnswer q={q} value={(value as string[]) ?? []} onChange={set} />}
          {q.kind === "upload" && (
            <UploadAnswer
              docs={file.docs}
              onAdd={(d) => updateFile((f) => ({ ...f, docs: [...f.docs, ...d] }))}
              onRemove={(id) => updateFile((f) => ({ ...f, docs: f.docs.filter((x) => x.id !== id) }))}
            />
          )}
        </div>

        {suggestion && (
          // only the amount and its button are green: the action point stands out, the rest stays quiet
          <div className="-mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[14px] bg-[#f3f3ed] px-4 py-3.5">
            <span className="flex max-w-[44ch] flex-col gap-0.5">
              <span className="text-[13px] text-[#5d6a61]">Based on what you&rsquo;ve told us</span>
              <span className="text-[19px] font-medium text-[#1a6b33]">About {naira(suggestion.value)}</span>
              <span className="text-[13px] leading-[1.45] text-[#5d6a61]">{suggestion.why}</span>
            </span>
            {value === suggestion.value ? (
              <span className="text-[13px] font-medium text-[#1a6b33]">Using this estimate</span>
            ) : (
              <button type="button" onClick={() => set(suggestion.value)} className="min-h-10 rounded-full bg-[#1a6b33] px-4 text-[13px] font-medium text-white hover:bg-[#145529]">
                Use {naira(suggestion.value)}
              </button>
            )}
          </div>
        )}

        <div>
          <button type="button" onClick={() => setHelp(!help)} aria-expanded={help} className="text-[14px] text-[#3d4a42] underline">
            What do you mean?
          </button>
          {help && <p className="m-0 mt-3 max-w-[52ch] rounded-[12px] bg-[#f3f3ed] px-4 py-3 text-[15px] leading-[1.55] text-[#3d4a42]">{q.help}</p>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <button
            type="button"
            onClick={() => {
              setReaction(null);
              setHelp(false);
              if (i > 0) setI(i - 1);
              else router.push("/app");
            }}
            className="min-h-12 px-1 text-[15px] text-[#3d4a42]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => next()}
            disabled={!ok}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-[15px] font-medium text-cream transition-opacity disabled:opacity-30"
          >
            {q.optional && !(q.kind === "upload" ? file.docs.length > 0 : answeredStrict(q, value)) ? "Skip for now" : i === qs.length - 1 ? "Finish" : "Next"}
            <Arrowhead className="h-[11px] w-[11px] rotate-180 text-lime" />
          </button>
        </div>
      </div>
    </main>
  );
}

function answeredStrict(q: Question, a: unknown) {
  return answered({ ...q, optional: false }, a);
}

function openingLine(key: ChapterKey, f: OwnerFile) {
  const who = audience(f.purpose);
  if (key === "basics") return `Two minutes. These are the basics ${who} asks first.`;
  if (key === "numbers") return "Rough guesses are fine. You can change any of this later.";
  return `These show ${who} how steady the business is. Each answer can move your value.`;
}

function Finished({ chapterKey, file }: { chapterKey: ChapterKey; file: OwnerFile }) {
  const v = valuate(file);
  const copy = {
    basics: {
      title: "Here's your first look",
      body: "It's wide because we don't know your sales and costs yet. Three minutes on those and it gets much tighter.",
      next: { href: "/app/file/numbers", label: "Add your sales and costs" },
    },
    numbers: {
      title: "Your numbers are in",
      body: "This is now worked out from what's actually left for you each month, what you own and what you owe.",
      next: { href: "/app/file/model", label: "Next: how you make money" },
    },
    model: {
      title: "Your file is complete",
      body: "Your report is ready: what it's worth, how sure we are, and every reason that moved it.",
      next: { href: "/app/report", label: "Open your report" },
    },
  }[chapterKey];

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#ecebe2] px-5 py-16 text-center">
      <div className="flex max-w-[560px] flex-col items-center gap-6">
        <SarahAvatar size={52} />
        <span className="text-[14px] text-[#5d6a61]">{CHAPTERS[chapterKey].title}: done</span>
        <h1 className="display m-0 text-[clamp(32px,4vw,44px)] font-normal leading-[1.08]">{copy.title}</h1>
        {v.stage !== "none" && (
          <div className="flex flex-col items-center gap-2">
            <p className="m-0 text-[clamp(52px,7vw,84px)] font-light leading-none tracking-[-0.05em]">{nairaRange(v.low, v.high)}</p>
            <span className="text-[14px] text-[#5d6a61]">
              How sure we are: <span className="font-medium text-ink">{confidenceLabel(v.confidence).toLowerCase()}</span>
            </span>
          </div>
        )}
        <p className="m-0 max-w-[44ch] text-[17px] leading-[1.55] text-[#3d4a42]">{copy.body}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={copy.next.href} className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-[15px] font-medium text-cream no-underline">
            {copy.next.label}
            <Arrowhead className="h-[11px] w-[11px] rotate-180 text-lime" />
          </Link>
          <Link href="/app" className="text-[15px] text-[#3d4a42]">
            Back to your desk
          </Link>
        </div>
      </div>
    </main>
  );
}
