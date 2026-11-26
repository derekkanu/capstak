"use client";

import { useEffect, useState } from "react";
import { Seal, Stop } from "./FilePieces";

/* "What goes in your file": an open, hole-punched page with the file's tabs sticking out of the right
   edge as the menu (the dashboard's real structure). Each tab shows what Capstack asks, in everyday
   words, and what the owner gets back. */

type Tab = {
  key: string;
  label: string;
  colour: string;
  ink: string;
  title: React.ReactNode;
  body: string;
  asks: string[];
  gets: string;
  soon?: boolean;
};

const TABS: Tab[] = [
  {
    key: "profile",
    label: "Profile",
    colour: "#cfc8c0",
    ink: "#042e1b",
    title: <>Who you are, in <em>three minutes</em></>,
    body: "Sign up with your phone number. Then one question at a time, the basics that open your file.",
    asks: ["What's your business called, and what do you sell?", "Where are you, and how long have you been open?", "Roughly how big is a normal month?"],
    gets: "A business profile and a first rough range, before you've typed a single spreadsheet cell.",
  },
  {
    key: "model",
    label: "How you make money",
    colour: "#93b99b",
    ink: "#042e1b",
    title: <>What makes your business <em>safer</em> than the next one</>,
    body: "Your business model, asked as normal questions. These answers show risk, and risk moves your value.",
    asks: ["If your main supplier stopped selling to you tomorrow, would you be in trouble?", "Do the same customers come back? How often?", "If you took a month off, would the business still run?"],
    gets: "A one-page picture of your business you can show a bank or a partner.",
  },
  {
    key: "numbers",
    label: "Your numbers",
    colour: "#c9dccb",
    ink: "#042e1b",
    title: <>No finance words. <em>Just your money.</em></>,
    body: "Rough answers are fine. If a question doesn't make sense, ask, and it's explained in plain words.",
    asks: ["Roughly what came in last month?", "What went out? Rent, stock, salaries, everything.", "Do you owe anyone for the business: a loan, a supplier, equipment?"],
    gets: "Your real profit, worked out for you, and what it means for your value.",
  },
  {
    key: "receipts",
    label: "Receipts",
    colour: "#e8e7df",
    ink: "#042e1b",
    title: <>Bring the receipts. <em>Raise your confidence.</em></>,
    body: "POS slips, bank statements, a photo of your sales book. Optional, and each one makes your number harder to argue with.",
    asks: ["Three months of bank statements", "POS or transfer summaries", "A list of equipment and stock"],
    gets: "A higher confidence score, and a range that gets tighter.",
    soon: true,
  },
  {
    key: "valuation",
    label: "Valuation",
    colour: "#042e1b",
    ink: "#d4ed6f",
    title: <>Your number, <em>stamped</em></>,
    body: "A range, how sure we are, and every reason that moved it, written down. Ready to hand to a buyer, a broker or a bank.",
    asks: ["Low, middle and high value in Naira", "A confidence score, and what would raise it", "Every reason, with how much it moved your value"],
    gets: "A report you can stand behind, from a file you built yourself.",
  },
];

export default function FileTabs() {
  const [active, setActive] = useState(TABS[0].key);
  const [held, setHeld] = useState(false);
  const t = TABS.find((x) => x.key === active)!;

  // flip through the tabs by itself until someone picks one
  useEffect(() => {
    if (held) return;
    const id = window.setInterval(() => {
      setActive((k) => TABS[(TABS.findIndex((x) => x.key === k) + 1) % TABS.length].key);
    }, 4200);
    return () => window.clearInterval(id);
  }, [held]);

  return (
    <div className="relative pr-11 md:pr-14">
      {/* the open page */}
      <div className="relative z-10 min-h-[460px] rounded-[6px] bg-cream py-8 pl-14 pr-6 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.5)] md:py-12 md:pl-20 md:pr-12">
        <span aria-hidden className="punched absolute bottom-6 left-5 top-6 w-[10px] md:left-7" />
        <div key={t.key} className="playground-in grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 text-ink/50">
              <span className="tab-label">( {t.label} )</span>
              {t.soon ? <span className="tab-label rounded-full bg-pop/15 px-2 py-1 text-[#b4440a]">With early access</span> : null}
            </div>
            <h3 className="display text-[30px] text-green md:text-[40px]">
              {t.title}
              <Stop />
            </h3>
            <p className="max-w-[44ch] text-[16px] leading-[1.6] text-ink/65">{t.body}</p>
            <p className="mt-auto max-w-[44ch] border-t border-ink/10 pt-5 text-[15px] leading-[1.6] text-ink/80">
              <span className="tab-label mr-2 text-ink/45">You get</span>
              {t.gets}
            </p>
          </div>
          <div className="relative">
            {t.key === "valuation" ? (
              <div className="relative rounded-[4px] bg-white p-6 shadow-[0_12px_26px_-18px_rgba(0,0,0,0.45)]">
                <p className="tab-label text-ink/45">Okafor Woodworks · estimated value</p>
                <p className="num mt-3 font-mono text-[30px] font-medium tracking-[-0.03em] text-green md:text-[34px]">₦28M – ₦36M</p>
                <p className="mt-1 text-[13px] text-ink/50">Confidence: medium</p>
                <ul className="mt-5 flex flex-col gap-2.5 border-t border-ink/10 pt-4 text-[14px]">
                  {[
                    ["Six years on the same street", "+₦4.4M"],
                    ["Customers come back", "+₦3.1M"],
                    ["One big timber supplier", "−₦1.2M"],
                    ["Equipment loan", "−₦1.2M"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-3">
                      <span className="text-ink/75">{k}</span>
                      <span className="num font-mono font-medium text-green">{v}</span>
                    </li>
                  ))}
                </ul>
                <Seal id="tabs" className="absolute -right-4 -top-6 h-20 w-20 rotate-[-12deg] text-[#2c3e86] opacity-90 mix-blend-multiply" />
              </div>
            ) : (
              <div className="receipt px-5 pb-7 pt-5 font-mono text-[13px] leading-[1.7] text-ink shadow-[0_12px_26px_-18px_rgba(0,0,0,0.45)]">
                <p className="mb-2 border-b border-dashed border-ink/25 pb-2 text-center text-[11px] font-semibold tracking-[0.14em]">
                  {t.key === "receipts" ? "WHAT YOU CAN ADD" : "WHAT WE ASK"}
                </p>
                <ol className="flex flex-col gap-2.5">
                  {t.asks.map((q, i) => (
                    <li key={q} className="grid grid-cols-[22px_1fr] gap-1">
                      <span className="text-ink/40">{String(i + 1).padStart(2, "0")}</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* tabs sticking out of the right edge */}
      {/* The tabs never run longer than the page: they share its height and overlap like real dividers.
          The open one takes the room its label needs, sits on top and sticks out furthest. */}
      <div
        role="tablist"
        aria-label="Sections of your file"
        aria-orientation="vertical"
        className="absolute bottom-5 right-0 top-5 z-0 flex w-[70px] flex-col md:w-[86px]"
      >
        {TABS.map((x, i) => {
          const on = x.key === active;
          const ai = TABS.findIndex((t) => t.key === active);
          return (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={on}
              title={x.label}
              onClick={() => {
                setHeld(true);
                setActive(x.key);
              }}
              className={`relative min-h-[46px] overflow-hidden whitespace-nowrap rounded-r-[10px] py-4 pl-[30px] pr-2.5 text-left md:pl-[34px] text-[12px] font-medium tracking-[-0.005em] transition-[transform,flex-grow,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [writing-mode:vertical-rl] md:px-3 md:text-[13px] ${
                i > 0 ? "-mt-3" : ""
              } ${on ? "shadow-[4px_8px_16px_-8px_rgba(0,0,0,0.55)]" : "hover:translate-x-1"}`}
              style={{
                background: x.colour,
                color: x.ink,
                flex: on ? "0 0 auto" : "1 1 0",
                zIndex: on ? 20 : 10 - Math.abs(i - ai),
                transform: on ? "translateX(6px)" : "translateX(0)",
              }}
            >
              {x.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
