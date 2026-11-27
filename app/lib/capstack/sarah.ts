import { boosts, modelAnswered, monthly, valuate } from "./engine";
import { lastSixMonths, naira, nairaRange } from "./format";
import { MODEL_KEYS, type OwnerFile, type Purpose } from "./types";

/* What Sarah says. She always says one thing: the single next step, why it matters, and what the owner gets for
   it. Everything she says is written for why they came (the purpose they picked when they signed up). */

export const PURPOSES: { key: Purpose; label: string; hint: string }[] = [
  { key: "curious", label: "I'm just curious", hint: "See what it's worth, no pressure" },
  { key: "sell", label: "I'm getting ready to sell", hint: "Know your price before a buyer names theirs" },
  { key: "loan", label: "I need it for a loan", hint: "Show a lender what the business is worth" },
  { key: "invest", label: "For an investor or partner", hint: "Agree a fair value before anyone buys in" },
  { key: "other", label: "Something else", hint: "Insurance, a family matter, planning ahead" },
];

/** who the owner will show this to */
export function audience(p: Purpose | null) {
  return p === "sell" ? "a buyer" : p === "loan" ? "a lender" : p === "invest" ? "an investor" : "anyone valuing a business";
}

export function welcomeLine(p: Purpose | null) {
  switch (p) {
    case "sell":
      return "You're getting ready to sell. In about ten minutes, you'll know what your business is worth and why.";
    case "loan":
      return "You need a value you can take to a lender. In about ten minutes you'll have one, with every reason written down.";
    case "invest":
      return "You're bringing someone in. In about ten minutes, you'll know what your business is worth and why.";
    case "curious":
      return "You want to know what your business is worth. In about ten minutes, you will, and why.";
    default:
      return "In about ten minutes, you'll know what your business is worth and why.";
  }
}

export type NextStep = { key: string; message: string; cta: string; href: string };

type F = Pick<OwnerFile, "purpose" | "basics" | "numbers" | "model" | "docs"> & Partial<Pick<OwnerFile, "chapterUpdatedAt">>;

/** numbers older than this get a nudge: a value is only as current as the sales behind it */
export const REFRESH_DAYS = 30;

const daysSince = (iso: string | undefined, now: Date) => (iso ? (now.getTime() - new Date(iso).getTime()) / 86_400_000 : 0);

/** "27 Nov" */
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export function nextStep(f: F, now = new Date()): NextStep {
  const who = audience(f.purpose);
  if (!f.basics)
    return {
      key: "basics",
      message: `Let's start with the basics ${who} asks first: what you do, where, and for how long. Two minutes, and you'll get a first look at your value straight after.`,
      cta: "Start with the basics",
      href: "/app/file/basics",
    };

  const v = valuate(f);
  if (!f.numbers && v.stage === "first-look")
    return {
      key: "numbers",
      message: `Here's your first look: ${nairaRange(v.low, v.high)}. It's wide because I don't know your sales and costs yet. Three minutes on those and it gets much tighter.`,
      cta: "Add your sales and costs",
      href: "/app/file/numbers",
    };

  const left = MODEL_KEYS.length - modelAnswered(f.model);
  if (left > 0) {
    const opener = f.numbers ? monthNote(f) : "";
    const started = left < MODEL_KEYS.length;
    return {
      key: "model",
      message: `${opener}Next, ${who} will want to know how steady your customers and suppliers are. ${left} quick question${left === 1 ? "" : "s"}, and each one can move your value.`,
      cta: started ? "Carry on with chapter 03" : "Start chapter 03",
      href: "/app/file/model",
    };
  }

  if (daysSince(f.chapterUpdatedAt?.numbers, now) > REFRESH_DAYS)
    return {
      key: "refresh",
      message: `It's been over a month since you updated your numbers. Add the latest month's sales and costs so what ${f.basics.businessName} is worth stays current.`,
      cta: "Update your numbers",
      href: "/app/file/numbers",
    };

  if (!f.docs.some((d) => d.kind === "bank"))
    return {
      key: "bank",
      message: `Your file is complete, and your report is ready. Bank statements are the quickest way to make it stronger: they back up the sales you told me about, and ${who} will ask for them.`,
      cta: "Add bank statements",
      href: "/app/documents?kind=bank",
    };

  const top = boosts(f)[0];
  return {
    key: "report",
    message: `Your report is ready to share: what ${f.basics.businessName} is worth, how sure we are, and every reason.${top ? ` If you want it even surer: ${top.label.toLowerCase()}.` : ""}`,
    cta: "Open your report",
    href: "/app/report",
  };
}

/** one honest line about the latest month against the others */
function monthNote(f: F) {
  if (!f.numbers) return "";
  const { sales } = monthly(f.numbers);
  const names = lastSixMonths();
  const last = sales[sales.length - 1];
  const best = Math.max(...sales);
  const worst = Math.min(...sales);
  if (last === best && last > worst) return `${names[5]} was your best month of the last six. `;
  if (last === worst && last < best) return `${names[5]} was a slower month, ${naira(best - last)} under your best. That's normal, and we account for it. `;
  return "Your numbers are in. ";
}

export type ChapterStatus = "todo" | "started" | "done" | "locked";

export type Chapter = {
  key: "basics" | "numbers" | "model" | "report";
  no: string;
  title: string;
  covers: string;
  gives: string;
  minutes: number | null;
  status: ChapterStatus;
  detail: string | null;
  /** when it was last saved, for chapters that are done */
  updatedAt: string | null;
  href: string;
};

export function chapters(f: F): Chapter[] {
  const answered = modelAnswered(f.model);
  const bankDocs = f.docs.filter((d) => d.kind === "bank").length;
  const allDocs = f.docs.length;
  const reportReady = !!(f.basics && f.numbers && answered === MODEL_KEYS.length);
  return [
    {
      key: "basics",
      no: "01",
      title: "About your business",
      covers: "What you do, where, and how long you've been open",
      gives: f.basics ? "Gave you your first look" : "Gives you a first look at what it's worth",
      minutes: 2,
      status: f.basics ? "done" : "todo",
      detail: f.basics ? `${f.basics.businessName}, ${f.basics.city}, ${f.basics.people} ${f.basics.people === 1 ? "person" : "people"}` : null,
      href: "/app/file/basics",
      updatedAt: f.basics ? (f.chapterUpdatedAt?.basics ?? null) : null,
    },
    {
      key: "numbers",
      no: "02",
      title: "Your sales and costs",
      covers: "What comes in, what goes out, what's left for you, and what you own and owe",
      gives: f.numbers ? "Gave you your numbers and a tighter range" : "Gives you your numbers and a much tighter range",
      minutes: 3,
      status: f.numbers ? "done" : "todo",
      detail: f.numbers
        ? allDocs
          ? `Backed by ${allDocs} document${allDocs === 1 ? "" : "s"}.${bankDocs ? "" : " Adding bank statements would make us much surer."}`
          : "Not backed by documents yet. Bank statements or POS slips would make us much surer."
        : "Back it up with bank statements or POS slips if you have them.",
      href: "/app/file/numbers",
      updatedAt: f.numbers ? (f.chapterUpdatedAt?.numbers ?? null) : null,
    },
    {
      key: "model",
      no: "03",
      title: "How you make money",
      covers: "Your customers, your suppliers, and how the business runs without you",
      gives: "Gives you a one-page picture to show a buyer or bank",
      minutes: 4,
      status: answered === MODEL_KEYS.length ? "done" : answered > 0 ? "started" : "todo",
      detail: answered > 0 && answered < MODEL_KEYS.length ? `${answered} of ${MODEL_KEYS.length} answered` : null,
      href: "/app/file/model",
      updatedAt: answered ? (f.chapterUpdatedAt?.model ?? null) : null,
    },
    {
      key: "report",
      no: "",
      title: "Your report",
      covers: `What it's worth, with every reason, ready to share with ${audience(f.purpose)}`,
      gives: reportReady ? "Ready to open and share" : "Opens when 01 to 03 are done",
      minutes: null,
      status: reportReady ? "done" : "locked",
      detail: null,
      href: "/app/report",
      updatedAt: null,
    },
  ];
}
