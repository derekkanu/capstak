"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Arrow } from "./FilePieces";

/* The guided valuation (onboarding → your file → dashboard) is the premium product being built next. Until it
   opens, every "Try it free" / guided-interview button shows this: what's coming, and a way to join the waitlist.
   Note: like the page's waitlist form, the email is not stored anywhere yet. */
export default function ComingSoonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // start fresh each time it opens
  useEffect(() => {
    if (open) {
      setJoined(false);
      setEmail("");
    }
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="coming-soon-title" className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-ink/55 backdrop-blur-sm" />
      <div className="playground-in relative w-full max-w-[460px] rounded-[6px] bg-paper px-7 pb-8 pt-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] md:px-9">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {joined ? (
          <div className="text-center">
            <div className="mx-auto mt-3 grid h-12 w-12 place-items-center rounded-full bg-lime">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green" fill="none" aria-hidden>
                <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 id="coming-soon-title" className="display mt-5 text-[30px] text-green">
              You&rsquo;re on the list
            </h3>
            <p className="mx-auto mt-3 max-w-[32ch] text-[15px] leading-[1.6] text-ink/65">
              We&rsquo;ll let you know the day your file can be opened. Until then, the quick estimate is free to use.
            </p>
            <button type="button" onClick={onClose} autoFocus className="btn btn-p btn-md mt-7">
              Back to the page
            </button>
          </div>
        ) : (
          <>
            <span className="tab-label inline-block rounded-full bg-lime px-2.5 py-1 text-green">Coming soon</span>
            <h3 id="coming-soon-title" className="display mt-4 text-[30px] leading-[1.1] text-green md:text-[34px]">
              The full valuation is almost ready
            </h3>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink/65">
              One question at a time, you&rsquo;ll open a file for your business, add your sales and costs at your own pace and
              see what it&rsquo;s worth, with every reason explained. Join the waitlist to be first in.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setJoined(true);
              }}
              className="mt-6 flex w-full items-stretch rounded-[8px] bg-white p-1.5 ring-1 ring-ink/10 focus-within:ring-ink/25"
            >
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
              />
              <button type="submit" className="btn btn-p btn-md shrink-0">
                <Arrow className="h-2.5 w-2.5 text-lime" />
                Join the waitlist
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                onClose();
                document.getElementById("estimate")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-4 text-[14px] text-ink/55 underline-offset-4 hover:text-ink hover:underline"
            >
              Try the free quick estimate meanwhile
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
