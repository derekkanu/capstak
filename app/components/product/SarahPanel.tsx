"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { greeting, sarahReply, SUGGESTIONS, type Reply } from "../../lib/capstack/chat";
import type { OwnerFile } from "../../lib/capstack/types";
import { Arrowhead, SarahAvatar } from "./Bits";

/* Sarah, on every page: a round button in the corner opens her chat in a side panel. She opens with the owner's
   next step and answers from their file. The conversation lasts while they move between pages. */

let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export function openSarah() {
  open = true;
  emit();
}
function closeSarah() {
  open = false;
  emit();
}
function useOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false,
  );
}

type Message = { from: "sarah" | "owner"; reply: Reply };

export default function SarahPanel({ file, button = true }: { file: OwnerFile; button?: boolean }) {
  const isOpen = useOpen();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // she opens with where the owner stands, fresh each time the panel opens on an empty conversation
  const shown: Message[] = messages.length ? messages : [{ from: "sarah", reply: greeting(file) }];

  useEffect(() => {
    if (!isOpen) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSarah();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    // braces matter: newer browsers return a promise from scrollIntoView, and an effect must return nothing
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function ask(text: string) {
    const t = text.trim();
    if (!t || typing) return;
    const base = messages.length ? messages : shown;
    setMessages([...base, { from: "owner", reply: { text: t } }]);
    setDraft("");
    setTyping(true);
    const history = base.slice(-8).map((m) => ({ role: m.from === "sarah" ? ("assistant" as const) : ("user" as const), content: m.reply.text }));
    // the server words the reply with whichever brain is switched on; if that fails, the built-in reply stands in.
    // A short pause at least, so it reads as a reply rather than an instant lookup.
    const reply = fetch("/api/sarah", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "chat", file, message: t, history }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<Reply>) : Promise.reject(new Error(String(r.status)))))
      .catch(() => sarahReply(t, file));
    Promise.all([reply, new Promise((r) => window.setTimeout(r, 500))]).then(([r]) => {
      setMessages((m) => [...m, { from: "sarah", reply: { text: r.text, action: r.action } }]);
      setTyping(false);
    });
  }

  return (
    <>
      {button && !isOpen && (
        <button
          type="button"
          onClick={openSarah}
          className="fixed bottom-5 right-5 z-40 flex min-h-14 items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-[15px] font-medium text-cream shadow-[0_18px_40px_-18px_rgba(15,27,20,0.6)] transition-transform hover:-translate-y-0.5 print:hidden"
        >
          <SarahAvatar size={40} />
          Ask Sarah
        </button>
      )}

      {isOpen && <button type="button" aria-label="Close Sarah" tabIndex={-1} onClick={closeSarah} className="fixed inset-0 z-40 bg-ink/25 md:bg-transparent" />}

      <aside
        role="dialog"
        aria-label="Chat with Sarah"
        aria-hidden={!isOpen}
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[420px] flex-col bg-cream-soft shadow-[-24px_0_60px_-30px_rgba(15,27,20,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <header className="flex items-center gap-3 border-b border-[#e3e4dc] px-5 py-4">
          <SarahAvatar size={44} />
          <span className="flex flex-1 flex-col">
            <span className="text-[16px] font-medium">Sarah</span>
            <span className="text-[12px] text-[#5d6a61]">Your guide, here on every page</span>
          </span>
          <button type="button" onClick={closeSarah} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-[#3d4a42] hover:bg-[#ecebe2]">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5" aria-live="polite">
          {shown.map((m, i) =>
            m.from === "sarah" ? (
              <div key={i} className="flex max-w-[92%] flex-col items-start gap-2.5">
                <p className="m-0 rounded-[18px] rounded-tl-[6px] bg-[#ecebe2] px-4 py-3 text-[15px] leading-[1.55]">{m.reply.text}</p>
                {m.reply.action && (
                  <Link
                    href={m.reply.action.href}
                    onClick={closeSarah}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-cream no-underline"
                  >
                    {m.reply.action.label}
                    <Arrowhead className="h-2.5 w-2.5 rotate-180 text-lime" />
                  </Link>
                )}
              </div>
            ) : (
              <p key={i} className="m-0 max-w-[85%] self-end rounded-[18px] rounded-tr-[6px] bg-ink px-4 py-3 text-[15px] leading-[1.55] text-cream">
                {m.reply.text}
              </p>
            ),
          )}
          {typing && (
            <span className="flex w-16 items-center justify-center gap-1 rounded-[18px] rounded-tl-[6px] bg-[#ecebe2] py-4" aria-label="Sarah is typing">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7a857c]" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </span>
          )}
          <div ref={end} />
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e3e4dc] px-5 pb-5 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} className="min-h-9 shrink-0 rounded-full bg-[#ecebe2] px-3.5 text-[13px] hover:bg-[#e0e0d6]">
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
            className="flex items-center gap-2 rounded-full border border-[#d7d9cd] bg-white py-1.5 pl-5 pr-1.5 focus-within:border-ink"
          >
            <input
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Sarah anything"
              aria-label="Your question for Sarah"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
            />
            <button type="submit" aria-label="Send" disabled={!draft.trim() || typing} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-lime disabled:opacity-30">
              <Arrowhead className="h-3 w-3 rotate-90" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
