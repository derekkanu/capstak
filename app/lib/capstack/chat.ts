import { boosts, confidenceLabel, sectorOf, valuate } from "./engine";
import { naira, nairaRange } from "./format";
import { audience, nextStep } from "./sarah";
import type { OwnerFile } from "./types";

/* Sarah's replies in the chat panel. Until live replies are switched on, she answers by matching what the owner
   asks to the questions owners ask most, using their own file (their value, how sure we are, what's pulling it
   down, their next step). Anything she can't answer, she says so and offers what she can. */

export type Reply = { text: string; action?: { label: string; href: string } };

export const SUGGESTIONS = ["What is my business worth?", "What should I do next?", "How can I raise my value?", "How do you work it out?"];

type F = Pick<OwnerFile, "name" | "purpose" | "basics" | "numbers" | "model" | "docs"> & Partial<Pick<OwnerFile, "chapterUpdatedAt">>;

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function greeting(f: F): Reply {
  const step = nextStep(f);
  return { text: `Hi ${f.name}. ${step.message}`, action: { label: step.cta, href: step.href } };
}

export function sarahReply(input: string, f: F): Reply {
  const q = input.toLowerCase().replace(/[’']/g, "'");
  const v = valuate(f);
  const name = f.basics?.businessName ?? "your business";
  const who = audience(f.purpose);

  if (has(q, "raise", "increase", "improve", "grow", "higher", "boost", "more valuable")) {
    if (v.stage !== "full")
      return { text: "Once your sales and costs are in, I can show you exactly what's pulling your value down and what would lift it.", action: { label: "Add your sales and costs", href: "/app/file/numbers" } };
    const down = v.reasons.filter((r) => r.delta < 0);
    if (!down.length)
      return { text: `Nothing in your answers is pulling ${name} down right now. The next lift comes from growing what's left for you each month: every extra ₦100k a month is worth about ${naira(100_000 * 12 * v.multiple)} to a buyer.` };
    return {
      text: `What's holding the price back: ${down.map((r) => `${r.label.toLowerCase()} (${r.why.toLowerCase()})`).join("; ")}. Working on these is what lifts what ${who} would pay.`,
      action: { label: "See every reason", href: "/app/report" },
    };
  }

  if (has(q, "sure", "confiden", "accurate", "wide", "narrow", "range")) {
    if (v.stage === "none") return { text: "As soon as you've told me the basics, I can show you a first look and how sure we are." , action: { label: "Start with the basics", href: "/app/file/basics" } };
    const top = boosts(f)[0];
    return {
      text: `How sure we are: ${confidenceLabel(v.confidence).toLowerCase()} (${v.confidence}%). The range shows it: it narrows as your answers are backed up.${top ? ` The biggest step from here: ${top.label.toLowerCase()} (+${top.gain}%).` : ""}`,
      action: top ? { label: top.label, href: top.href } : undefined,
    };
  }

  if (has(q, "worth", "value", "valuation", "price", "how much")) {
    if (v.stage === "none") return { text: "I'll have a first look for you after two minutes on the basics: what you do, where, and for how long.", action: { label: "Start with the basics", href: "/app/file/basics" } };
    if (v.stage === "first-look")
      return { text: `A first look puts ${name} at ${nairaRange(v.low, v.high)}. It's wide because I don't know your sales and costs yet.`, action: { label: "Add your sales and costs", href: "/app/file/numbers" } };
    return {
      text: `Right now I'd put ${name} at ${nairaRange(v.low, v.high)}, most likely about ${naira(v.mid)}. After paying what it owes and adding its cash, you'd keep about ${naira(v.afterDebts)}.`,
      action: { label: "Open your report", href: "/app/report" },
    };
  }

  if (has(q, "next", "what should", "where do i", "start", "what do i do")) {
    const s = nextStep(f);
    return { text: s.message, action: { label: s.cta, href: s.href } };
  }

  if (has(q, "update", "change", "edit", "new month", "latest")) {
    return {
      text: "Open any chapter and change what's different. Your value updates the moment you finish. Your sales and costs are the ones to keep current: add each new month as it ends.",
      action: { label: "Update your numbers", href: "/app/file/numbers" },
    };
  }

  if (has(q, "debt", "owe", "loan", "liabilit")) {
    return {
      text: `What a business is worth doesn't change with what it owes; what you'd keep does. So I show both.${v.stage === "full" ? ` For ${name}: worth about ${naira(v.mid)}, and you'd keep about ${naira(v.afterDebts)}.` : ""} That's how ${who} will look at it too.`,
    };
  }

  if (has(q, "document", "statement", "upload", "bank", "receipt", "pos", "proof")) {
    return {
      text: `Documents back up your answers, so we're surer and ${who} can check them. Start with six months of bank statements; photos of POS slips and receipts are fine too. Only you can see them until you share.`,
      action: { label: "Add documents", href: "/app/documents" },
    };
  }

  if (has(q, "left for you", "profit", "what's left", "earn")) {
    return { text: "What's left for you is what comes in, minus everything you spend to run the business, before you pay yourself. It's what a new owner would take home, so it's what buyers pay for." };
  }

  if (has(q, "how do you", "work it out", "method", "calculat", "multiple", "formula")) {
    const extra =
      v.stage === "full" && f.basics
        ? ` For ${name}, buyers of ${sectorOf(f.basics.sector).label.toLowerCase()} businesses start around ${sectorOf(f.basics.sector).multiple.toFixed(1)} years of what's left for you; your answers moved it to ${v.multiple.toFixed(1)}.`
        : "";
    return {
      text: `Mainly the way brokers value small businesses: what's left for you each year, times what buyers pay in your trade. I check it against what the business should earn from here and what it owns. The rules are fixed, so the same answers always give the same result.${extra}`,
      action: v.stage === "full" ? { label: "See how it was worked out", href: "/app/report" } : undefined,
    };
  }

  if (has(q, "who can see", "private", "privacy", "share", "secure", "safe")) {
    return { text: "Only you can see your file until you choose to share your report." };
  }

  if (has(q, "formal", "official", "legal", "valuer", "tax", "certif")) {
    return { text: "It's a careful estimate with every reason written down, good for knowing where you stand and starting a conversation. For a legal or tax valuation you'd still use a registered valuer, and your report gives them a head start." };
  }

  if (has(q, "hello", "hi ", "hey", "good morning", "good afternoon") || q.trim() === "hi") return greeting(f);
  if (has(q, "thank")) return { text: "Any time. I'm here whenever you need me." };

  return {
    text: "I can't answer that one yet. I can tell you what your business is worth, how sure we are, what to do next, how to raise your value, or explain any word on your file.",
  };
}
