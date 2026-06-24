"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ValuationReport from "./ValuationReport";
import type { ValuationInput, ValuationResult } from "../lib/valuation";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm Capstak's valuation assistant. I'll ask a few simple questions about your business — no finance background needed, and you can ask me anything you don't understand along the way. The more accurate your answers, the more accurate your valuation. To start: what's the name of your business?";

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

  const send = async () => {
    const text = input.trim();
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

  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col bg-cream-soft">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-3 md:px-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-lime">
            <SparkIcon />
          </span>
          <span className="text-[15px] font-medium text-ink">Capstak Valuation Demo</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close demo"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      {report ? (
        <div className="flex-1 overflow-y-auto bg-cream-soft">
          <ValuationReport input={report.input} result={report.result} onRestart={reset} />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(320px,2fr)_3fr]">
          <InfoPanel />
          {/* Chat */}
          <div className="flex min-h-0 flex-col bg-cream-soft">
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6 md:px-8">
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.content} />
              ))}
              {loading && <Typing />}
            </div>
            <div className="border-t border-ink/10 bg-white px-4 py-3 md:px-6">
              <div className="mx-auto flex max-w-[680px] items-end gap-2 rounded-[16px] bg-cream-soft p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Type your answer…"
                  className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-ink placeholder:text-ink/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-green text-lime transition-transform hover:scale-[1.03] disabled:opacity-40"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="mx-auto mt-2 max-w-[680px] text-center text-[11px] text-ink/40">
                A guided demo — answers stay in your browser. Estimate only, not financial advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function InfoPanel() {
  return (
    <div className="hidden flex-col justify-center overflow-y-auto border-r border-ink/10 px-8 py-10 md:flex lg:px-12"
      style={{
        background: [
          "radial-gradient(70% 60% at 15% 10%, rgba(200, 224, 67, 0.18), transparent 60%)",
          "radial-gradient(60% 70% at 95% 95%, rgba(120, 200, 130, 0.16), transparent 60%)",
          "linear-gradient(180deg, #ffffff 0%, #fbfaf2 100%)",
        ].join(", "),
      }}
    >
      <div className="max-w-[420px]">
        <span className="inline-flex items-center gap-2 rounded-full bg-green/8 px-3 py-1 text-[12px] font-medium text-green">
          <SparkIcon /> No expertise required
        </span>
        <h2 className="mt-5 text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-ink lg:text-[32px]">
          You don&rsquo;t need to be a{" "}
          <span className="serif-italic highlight-mark">finance pro.</span>
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
          Just answer in plain words, the way you&rsquo;d describe your business
          to a friend. Stuck on a question? Ask the assistant to explain — that
          &rsquo;s what it&rsquo;s here for.
        </p>

        <ul className="mt-8 space-y-4">
          <InfoPoint title="Ask anything, anytime">
            If a question doesn&rsquo;t make sense, just ask. The assistant will
            explain it simply and pick up where you left off.
          </InfoPoint>
          <InfoPoint title="Accuracy in, accuracy out">
            The more honest and precise your answers, the sharper your
            valuation. Rough estimates are fine — best guesses welcome.
          </InfoPoint>
          <InfoPoint title="A full report at the end">
            When we&rsquo;re done, you&rsquo;ll get a polished valuation report
            with charts — and you can download it as a PDF.
          </InfoPoint>
        </ul>
      </div>
    </div>
  );
}

function InfoPoint({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-lime">
        <CheckIcon />
      </span>
      <div>
        <p className="text-[14px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink/60">{children}</p>
      </div>
    </li>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-[16px] px-4 py-2.5 text-[14px] leading-relaxed ${
          isUser
            ? "rounded-br-[4px] bg-green text-lime"
            : "rounded-bl-[4px] bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-[16px] rounded-bl-[4px] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M8 1l1.4 4.2L13.6 6.6 9.4 8 8 12.2 6.6 8 2.4 6.6 6.6 5.2z" />
    </svg>
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
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M2.5 8h9m0 0L8 4.5M11.5 8 8 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
