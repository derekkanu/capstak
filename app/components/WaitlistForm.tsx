"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  id?: string;
  className?: string;
};

export default function WaitlistForm({ id, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id !== "waitlist") return;
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest<HTMLAnchorElement>('a[href="#waitlist"]');
      if (!link) return;
      e.preventDefault();
      const input = inputRef.current;
      if (!input) return;
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        input.focus({ preventScroll: true });
      }, 500);
    };
    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEmail("");
  };

  return (
    <>
      <form
        id={id}
        onSubmit={handleSubmit}
        className={`flex w-full items-stretch rounded-[14px] bg-cream-soft p-1.5 ${className}`}
      >
        <input
          ref={inputRef}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          aria-label="Email address"
          className="flex-1 bg-transparent px-4 py-3 text-[14px] text-ink placeholder:text-[#9c9c9c] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-[10px] bg-cream px-5 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-cream-deep"
        >
          Get Notified
        </button>
      </form>

      {open && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="waitlist-modal-title"
              className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            >
              <button
                type="button"
                aria-label="Close"
                tabIndex={-1}
                onClick={closeModal}
                className="absolute inset-0 h-full w-full cursor-default bg-ink/55 backdrop-blur-sm"
              />
              <div className="relative w-full max-w-md rounded-[24px] bg-white px-8 py-10 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-green" fill="none" aria-hidden>
                    <path
                      d="M5 12.5l4 4 10-10"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3
                  id="waitlist-modal-title"
                  className="mt-5 text-[22px] font-medium tracking-tight text-ink"
                >
                  Thank you
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink/70">
                  We will notify you as soon as we are live.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  autoFocus
                  className="mt-7 rounded-[10px] bg-green px-7 py-3 text-[14px] font-medium text-lime transition-transform hover:scale-[1.02]"
                >
                  OK
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
