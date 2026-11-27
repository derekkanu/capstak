"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SarahAvatar, Wordmark } from "../components/product/Bits";
import { PURPOSES } from "../lib/capstack/sarah";
import { hasFile, normaliseEmail, signIn, updateFile, useOwnerFile } from "../lib/capstack/store";
import type { Purpose } from "../lib/capstack/types";

/* Sign up or log in: first name and email, a 6-digit code, then (first time only) Sarah asks why they came.
   Until real email sending is set up, any 6 digits pass; the code screen says so. */

type Step = "details" | "code" | "purpose";

export default function StartPage() {
  const router = useRouter();
  const { ready, file } = useOwnerFile();
  const [chosen, setStep] = useState<Step>("details");
  // signed in but not yet told Sarah why they came: that question is the only step left
  const step: Step = ready && file && !file.purpose && chosen !== "code" ? "purpose" : chosen;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [share, setShare] = useState(false);
  const [error, setError] = useState("");

  // signed in (just now, or from an earlier visit): owners who've told Sarah why they came go to their desk;
  // anyone who hasn't answers that first
  useEffect(() => {
    if (!ready || !file || step === "code") return;
    if (file.purpose) router.replace("/app");
  }, [ready, file, step, router]);

  const returning = email.includes("@") && ready && hasFile(email);

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const clean = normaliseEmail(email);
    if (!returning && name.trim().length < 2) return setError("Tell us your first name, so Sarah knows what to call you.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return setError("That email doesn't look right. Check it and try again.");
    setError("");
    setStep("code");
  }

  function verified() {
    signIn(name || "there", email, share);
  }

  return (
    <main className="min-h-svh bg-paper px-5 py-6 md:px-10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between">
        <Wordmark href="/" />
        <Link href="/" className="text-[14px] text-[#3d4a42]">
          Back to the site
        </Link>
      </div>

      <div className="mx-auto mt-[12vh] w-full max-w-[440px]">
        {step === "details" && (
          <form onSubmit={sendCode} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="display m-0 text-[40px] leading-[1.05] text-ink md:text-[48px]">{returning ? "Welcome back" : "Open your file"}</h1>
              <p className="m-0 text-[16px] leading-[1.55] text-[#3d4a42]">
                {returning
                  ? "We'll send a code to your email and open your file where you left it."
                  : "Your first name and email. We'll send a 6-digit code to check it's you. Coming back? Use the same email."}
              </p>
            </div>
            {!returning && (
              <label className="flex flex-col gap-2 text-[14px] font-medium">
                First name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Nkechi"
                  className="min-h-[52px] rounded-[12px] border border-[#d7d9cd] bg-cream-soft px-4 text-[16px] font-normal outline-none focus:border-ink"
                />
              </label>
            )}
            <label className="flex flex-col gap-2 text-[14px] font-medium">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                className="min-h-[52px] rounded-[12px] border border-[#d7d9cd] bg-cream-soft px-4 text-[16px] font-normal outline-none focus:border-ink"
              />
            </label>
            {!returning && (
              <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.5] text-[#3d4a42]">
                <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#042e1b]" />
                <span>Help make Capstack better for businesses like mine: use my figures, without my name or business name, to build benchmarks.</span>
              </label>
            )}
            {error && (
              <p role="alert" className="m-0 text-[14px] text-[#a33a12]">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-p btn-lg w-full justify-center">
              Send my code
            </button>
            <p className="m-0 text-[13px] leading-[1.55] text-[#5d6a61]">Only you can see your file until you choose to share it.</p>
          </form>
        )}

        {step === "code" && (
          <CodeStep
            email={normaliseEmail(email)}
            onBack={() => setStep("details")}
            onDone={() => {
              verified();
              setStep("purpose");
            }}
          />
        )}

        {step === "purpose" && file && (
          <PurposeStep
            name={file.name}
            onPick={(p) => {
              updateFile((f) => ({ ...f, purpose: p }));
              router.push("/app");
            }}
          />
        )}
      </div>
    </main>
  );
}

function CodeStep({ email, onBack, onDone }: { email: string; onBack: () => void; onDone: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => boxes.current[0]?.focus(), []);

  function set(i: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) {
      const next = [...digits];
      next[i] = "";
      setDigits(next);
      return;
    }
    // a pasted code fills from here on
    const next = [...digits];
    typed
      .slice(0, 6 - i)
      .split("")
      .forEach((d, k) => (next[i + k] = d));
    setDigits(next);
    const to = Math.min(5, i + typed.length);
    boxes.current[to]?.focus();
    if (next.every(Boolean)) window.setTimeout(onDone, 250);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="display m-0 text-[40px] leading-[1.05] text-ink md:text-[48px]">Check your email</h1>
        <p className="m-0 text-[16px] leading-[1.55] text-[#3d4a42]">
          We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. It works for 10 minutes.
        </p>
      </div>
      <fieldset className="m-0 flex gap-2.5 border-0 p-0">
        <legend className="sr-only">Your 6-digit code</legend>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            value={d}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            className="h-[60px] w-full min-w-0 rounded-[12px] border border-[#d7d9cd] bg-cream-soft text-center font-mono text-[24px] outline-none focus:border-ink"
          />
        ))}
      </fieldset>
      <p className="m-0 rounded-[10px] bg-[#ecebe2] px-3.5 py-2.5 text-[13px] text-[#3d4a42]">Test mode: emails aren&rsquo;t sent yet, so any 6 digits work.</p>
      <button type="button" onClick={onBack} className="self-start text-[14px] text-[#3d4a42] underline">
        Use a different email
      </button>
    </div>
  );
}

function PurposeStep({ name, onPick }: { name: string; onPick: (p: Purpose) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <SarahAvatar size={48} />
        <span className="flex flex-col">
          <span className="text-[15px] font-medium">Sarah</span>
          <span className="text-[13px] text-[#5d6a61]">Your guide</span>
        </span>
      </div>
      <h1 className="display m-0 text-[34px] leading-[1.1] text-ink md:text-[40px]">
        Hi {name}, I&rsquo;m Sarah. What brings you to Capstack?
      </h1>
      <p className="m-0 text-[15px] leading-[1.55] text-[#3d4a42]">I&rsquo;ll set up your file around it. You can change this later.</p>
      <div className="flex flex-col gap-2.5">
        {PURPOSES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onPick(p.key)}
            className="flex min-h-[60px] flex-col items-start justify-center gap-0.5 rounded-[14px] border border-[#d7d9cd] bg-cream-soft px-5 py-3 text-left transition-colors hover:border-ink"
          >
            <span className="text-[16px] font-medium">{p.label}</span>
            <span className="text-[13px] text-[#5d6a61]">{p.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
