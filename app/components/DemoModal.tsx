"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ValuationReport from "./ValuationReport";
import SilkArt from "./SilkArt";
import { INTAKE_STAGES, type ValuationInput, type ValuationResult } from "../lib/valuation";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm Capstack's valuation assistant. I'll ask a few simple questions about your business — no finance background needed, and you can ask me anything you don't understand along the way. The more accurate your answers, the more accurate your valuation. To start: what's the name of your business?";

const QUICK_REPLIES = ["What does that mean?", "I'm not sure, can I estimate?"];

// Cumulative question counts per stage, used to show roughly where the
// interview is. The assistant asks one question per turn.
const STAGE_ENDS = INTAKE_STAGES.reduce<number[]>((acc, s) => {
  acc.push((acc[acc.length - 1] ?? 0) + s.questions.length);
  return acc;
}, []);

function stageFor(userTurns: number) {
  const i = STAGE_ENDS.findIndex((end) => userTurns < end);
  return i === -1 ? INTAKE_STAGES.length - 1 : i;
}

// Solid paper base plus the homepage's soft cream and mint stains. Set inline
// so the overlay is always opaque, independent of global CSS.
const BACKDROP: React.CSSProperties = {
  backgroundColor: "#f4f5f4",
  backgroundImage: [
    "radial-gradient(closest-side, rgba(243, 232, 211, 0.95) 0%, rgba(243, 232, 211, 0) 100%)",
    "radial-gradient(closest-side, rgba(214, 234, 219, 0.95) 0%, rgba(214, 234, 219, 0) 100%)",
  ].join(", "),
  backgroundSize: "min(1000px, 95vw) 800px, min(900px, 90vw) 800px",
  backgroundPosition:
    "right calc(-1 * min(360px, 40vw)) top -120px, right calc(-1 * min(300px, 40vw)) bottom -260px",
  backgroundRepeat: "no-repeat",
};

type Props = { open: boolean; onClose: () => void };

export default function DemoModal({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ input: ValuationInput; result: ValuationResult } | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !report) inputRef.current?.focus();
  }, [open, report]);

  const reset = () => {
    setMessages([{ role: "assistant", content: GREETING }]);
    setInput("");
    setReport(null);
    setLoading(false);
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.type === "report") {
        setReport({ input: data.input, result: data.result });
      } else {
        setMessages([...next, { role: "assistant", content: data.text }]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Sorry — something went wrong on my end. Could you try sending that again?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open || typeof document === "undefined") return null;

  const userTurns = messages.filter((m) => m.role === "user").length;
  const stage = stageFor(userTurns);
  const progress = Math.min(1, userTurns / STAGE_ENDS[STAGE_ENDS.length - 1]);

  return createPortal(
    <div className="demo-backdrop fixed inset-0 z-[120] flex flex-col bg-[#f4f5f4]" style={BACKDROP}>
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/[0.06] bg-white px-5 md:px-7">
        <div className="flex items-center gap-4">
          <img src="/logo-capstack.png" alt="Capstack" className="h-[34px] w-auto" draggable={false} />
          <span className="hidden h-5 border-l border-ink/10 sm:block" />
          <span className="hidden text-[15px] text-ink/60 sm:block">
            {report ? "Your valuation report" : "Valuation interview"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close demo"
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-ink/[0.05] text-ink/60 transition-colors hover:bg-ink/[0.09] hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      {report ? (
        <div className="flex-1 overflow-y-auto">
          <ValuationReport input={report.input} result={report.result} onRestart={reset} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(340px,5fr)_minmax(0,8fr)]">
          <StagePanel stage={stage} progress={progress} />

          {/* Chat */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-8 md:px-10 md:py-12">
              <div className="mx-auto flex max-w-[720px] flex-col gap-5">
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} text={m.content} />
                ))}
                {loading && <Typing />}
              </div>
            </div>

            {/* Composer: Exa-style prompt card */}
            <div className="px-4 pb-4 md:px-10 md:pb-8">
              <div className="mx-auto max-w-[720px]">
                <div className="mb-3 flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      disabled={loading}
                      className="rounded-[8px] border border-ink/10 bg-white/70 px-3 py-1.5 text-[13px] text-ink/70 backdrop-blur transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-40"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="rounded-[18px] border border-ink/10 bg-white p-3 shadow-[0_24px_60px_-30px_rgba(12,29,18,0.35)]">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={2}
                    placeholder="Type your answer…"
                    className="max-h-40 w-full resize-none bg-transparent px-2 pt-1 text-[16px] leading-[1.5] text-ink placeholder:text-ink/35 focus:outline-none md:text-[17px]"
                  />
                  <div className="mt-1 flex items-center justify-between gap-3 pl-2">
                    <p className="text-[13px] text-ink/40">
                      Rough estimates are fine. Press Enter to send.
                    </p>
                    <button
                      type="button"
                      onClick={() => send()}
                      disabled={loading || !input.trim()}
                      aria-label="Send"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-green text-lime shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors hover:bg-green-mid disabled:opacity-35"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-center text-[12px] text-ink/40">
                  A guided demo. Answers stay in your browser. Estimate only, not financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function StagePanel({ stage, progress }: { stage: number; progress: number }) {
  return (
    <>
      {/* Phones: a compact progress strip */}
      <div className="shrink-0 border-b border-ink/[0.06] bg-white/70 px-5 py-3 backdrop-blur md:hidden">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-medium text-ink">{INTAKE_STAGES[stage].title}</span>
          <span className="text-ink/45">
            Step {stage + 1} of {INTAKE_STAGES.length}
          </span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-ink/[0.08]">
          <div
            className="h-full rounded-full bg-[#2a9d4f] transition-[width] duration-500"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Desktop: dark silk story panel */}
      <aside className="grain relative hidden overflow-hidden md:block">
        <SilkArt mood="deep" />
        <div className="relative z-[2] flex h-full flex-col justify-between overflow-y-auto px-10 py-12 text-cream lg:px-14 lg:py-16">
          <div>
            <h2 className="display max-w-[13ch] text-[40px] text-cream lg:text-[48px]">
              You don&rsquo;t need to be a finance pro
            </h2>
            <p className="mt-5 max-w-[34ch] text-[16px] leading-[1.6] text-cream/65">
              Answer in plain words, the way you&rsquo;d describe your business to a friend. Stuck
              on a question? Ask the assistant to explain it.
            </p>

            <ol className="mt-12 flex flex-col">
              {INTAKE_STAGES.map((s, i) => {
                const done = i < stage;
                const on = i === stage;
                return (
                  <li
                    key={s.title}
                    className={`flex items-center gap-4 border-l-2 py-3 pl-5 transition-colors ${
                      on ? "border-cream" : "border-cream/10"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] ${
                        done
                          ? "bg-lime text-green"
                          : on
                            ? "bg-cream text-green"
                            : "border border-cream/25 text-cream/45"
                      }`}
                    >
                      {done ? <CheckIcon /> : i + 1}
                    </span>
                    <span
                      className={`text-[17px] ${
                        on ? "font-medium text-cream" : done ? "text-cream/70" : "text-cream/40"
                      }`}
                    >
                      {s.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-12 max-w-[36ch] text-[14px] leading-[1.6] text-cream/50">
            When we&rsquo;re done you&rsquo;ll get a full valuation report with charts, ready to
            download as a PDF.
          </p>
        </div>
      </aside>
    </>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-[14px] rounded-tr-[4px] bg-green px-4 py-3 text-[15px] leading-[1.55] text-cream md:text-[16px]">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="max-w-[85%] whitespace-pre-wrap rounded-[14px] rounded-tl-[4px] border border-ink/[0.07] bg-white px-4 py-3 text-[15px] leading-[1.6] text-ink/85 shadow-[0_1px_2px_rgba(12,29,18,0.04)] md:text-[16px]">
        {text}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green text-[13px] font-semibold text-lime">
      C
    </span>
  );
}

function Typing() {
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="flex items-center gap-1.5 rounded-[14px] rounded-tl-[4px] border border-ink/[0.07] bg-white px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/35"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M10 16V4M4.5 9.5L10 4l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
