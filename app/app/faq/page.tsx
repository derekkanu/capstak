"use client";

import AppHeader from "../../components/product/AppHeader";
import { openSarah } from "../../components/product/SarahPanel";
import { audience } from "../../lib/capstack/sarah";
import { useOwnerFile } from "../../lib/capstack/store";

/* The questions owners ask most, answered in plain words. Anything not here, Sarah answers in the chat. */

const ANSWERS = (who: string) => [
  {
    q: "How do you work out what my business is worth?",
    a: "Mainly the way brokers do it for small businesses: what's left for you each year, times what buyers typically pay in your trade. We check that against what the business should earn from here, and what it owns. Each answer you give can move it up or down, and your report shows every step.",
  },
  {
    q: "What do you mean by “what's left for you”?",
    a: "What comes in, minus everything you spend to run the business, before you pay yourself. It's the money a new owner would take home, so it's what buyers pay for.",
  },
  {
    q: "Why is it a range and not one figure?",
    a: "Because no one knows the exact price until someone pays it. The range shows how sure we are: it starts wide and narrows as you back your answers up with documents.",
  },
  {
    q: "Why do my debts not lower the value?",
    a: `What a business is worth doesn't change with what it owes; what you'd keep does. So we show both: the value, and what you'd keep after paying the debts and adding the cash. That's how ${who} will look at it too.`,
  },
  {
    q: "Are rough guesses fine?",
    a: "Yes. A rough answer now is better than no answer. You can change anything later, and documents firm it up.",
  },
  {
    q: "How do I keep my value up to date?",
    a: "Open any chapter on your desk and press Update. Change what's different and your value refreshes the moment you finish. Add each new month's sales and costs as it ends; we'll remind you if it's been over a month.",
  },
  {
    q: "Which documents should I add?",
    a: "Start with six months of bank statements: they back up your sales and are the first thing a buyer or lender asks for. POS slips, supplier invoices and a stock list help too. Photos are fine.",
  },
  {
    q: "Who can see my file?",
    a: "Only you, until you choose to share your report.",
  },
  {
    q: "Is this a formal valuation?",
    a: "No. It's a careful estimate with every reason written down, good for knowing where you stand and starting a conversation. For a legal or tax valuation, you'd still use a registered valuer, and your report gives them a head start.",
  },
];

export default function FaqPage() {
  const { file } = useOwnerFile();
  if (!file) return null;
  return (
    <>
      <div className="bg-[#ecebe2] px-5 pb-12 md:px-16">
        <AppHeader file={file} />
        <div className="flex max-w-[640px] flex-col gap-3">
          <h1 className="display m-0 text-[clamp(36px,4vw,56px)] font-normal leading-[1.04]">Questions owners ask</h1>
          <p className="m-0 text-[17px] leading-[1.55] text-[#3d4a42]">
            Plain answers to the things that come up most. Can&rsquo;t find yours?{" "}
            <button type="button" onClick={openSarah} className="text-ink underline">
              Ask Sarah
            </button>
            .
          </p>
        </div>
      </div>
      <div className="flex max-w-[860px] flex-col px-5 pb-24 pt-10 md:px-16">
        {ANSWERS(audience(file.purpose)).map((x) => (
          <details key={x.q} className="group border-t border-[#e3e4dc] last:border-b">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] [&::-webkit-details-marker]:hidden">
              {x.q}
              <span aria-hidden className="text-[22px] font-light text-[#7a857c] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="m-0 max-w-[62ch] pb-5 text-[15px] leading-[1.6] text-[#3d4a42]">{x.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
