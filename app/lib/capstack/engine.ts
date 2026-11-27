import { SECTORS, type Step } from "../quickEstimate";
import { MODEL_KEYS, type Basics, type Model, type Numbers, type OwnerFile, type SalesBand, type YearsBand } from "./types";

/**
 * The full valuation. The AI (later) only gathers and explains; this file sets the value, with fixed rules, so the
 * same answers always give the same result and every step can be shown.
 *
 * Three methods, each run only when it has enough to stand on, blended by weight:
 *
 * 1. Comparison (market), the backbone, always runs. What's left for the owner a year (seller's discretionary
 *    earnings: profit before paying themselves) × the multiple buyers pay in the trade. The trade multiples are the
 *    quick estimate's (small-business sale data, about 2.6–2.7× earnings in 2025–26, taken ~20% lower for Nigeria's
 *    risk), moved up or down by size, track record, growth, records and the business-model answers. Checked
 *    against sales: buyers in a trade rarely pay more than a set share of a year's sales.
 *
 * 2. Income (future earnings), runs with 2+ years trading and last year's sales. Earnings after paying a manager
 *    to run it (a buyer has to replace the owner) are capitalised: value = E × (1 + g) / (d − g). The discount rate
 *    d is built up: Nigerian government bonds (~16.5%, Nov 2026) + an equity premium (6%) + a small-business
 *    premium (15%: buyers of Nigerian small businesses expect their money back in about 2–4 years) + a
 *    specific-risk premium (0–10%) from the answers. g is a cautious 10% a year in Naira, well under inflation,
 *    so real growth isn't assumed. Like comparison, it's held under the trade's share of a year's sales.
 *
 * 3. Assets, the floor, runs once the numbers are in. What the equipment would sell for plus stock at 80% (a buyer
 *    pays less than cost for stock). The value never goes below it.
 *
 * Every method values the business before debts and without its cash, the way small businesses change hands;
 * "after debts" adds the cash and takes off what's owed.
 *
 * How sure we are is a score out of 100 from what's been given and backed up; the range narrows as it rises.
 */

export const RISK_FREE = 0.165;
export const EQUITY_PREMIUM = 0.06;
export const SMALL_BUSINESS_PREMIUM = 0.15;
export const LONG_RUN_GROWTH = 0.1;
const STOCK_RECOVERY = 0.8;

const SALES_BAND_MID: Record<SalesBand, number> = {
  lt500k: 300_000,
  "500k-2m": 1_200_000,
  "2m-5m": 3_500_000,
  "5m-20m": 10_000_000,
  gt20m: 30_000_000,
};

const YEARS_TENURE: Record<YearsBand, "new" | "mid" | "established"> = {
  lt1: "new",
  "1-2": "new",
  "2-5": "mid",
  "5-10": "established",
  "10+": "established",
};

export const sectorOf = (key: Basics["sector"]) => SECTORS.find((s) => s.key === key) ?? SECTORS[3];

/** rounds to 2 significant figures: an estimate should not look more exact than it is */
export function nice(n: number) {
  if (n <= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}

// ---------- the first look: from the basics alone ----------

/**
 * Before the numbers are in, all we have is the trade and a rough size of sales. Small businesses sell for roughly
 * 0.4–0.8 of a year's sales depending on the trade; we use 75% of the trade's sales ceiling and keep the range
 * wide, because we don't know what's left over.
 */
export function firstLook(b: Basics) {
  const sector = sectorOf(b.sector);
  const yearlySales = SALES_BAND_MID[b.salesBand] * 12;
  let mid = yearlySales * sector.salesCap * 0.75;
  const tenure = YEARS_TENURE[b.years];
  if (tenure === "new") mid *= 0.8;
  else if (tenure === "established") mid *= 1.1;
  return { low: nice(mid * 0.55), mid: nice(mid), high: nice(mid * 1.45) };
}

// ---------- monthly picture ----------

/** sales, costs and what's left for each of the last six months. Costs are rebuilt from last month's: the fixed
 *  part stays, the rest moves with sales. */
export function monthly(n: Numbers) {
  const last = n.months[n.months.length - 1] || 0;
  const fixed = Math.min(n.fixedCosts, n.lastMonthCosts);
  const ratio = last > 0 ? Math.min(1, Math.max(0, (n.lastMonthCosts - fixed) / last)) : 0;
  const sales = n.months.map((m) => Math.max(0, m));
  const costs = sales.map((s) => Math.round(fixed + ratio * s));
  const left = sales.map((s, i) => s - costs[i]);
  return { sales, costs, left };
}

function average(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export type Trend = "shrinking" | "keeping-up" | "growing";

/** growing or shrinking: the last three months against the three before, and this year against last year */
export function trendOf(n: Numbers): Trend {
  const first = average(n.months.slice(0, 3));
  const recent = average(n.months.slice(3));
  let change = first > 0 ? recent / first - 1 : 0;
  if (n.lastYearSales && n.lastYearSales > 0) {
    // a year's change in Naira: prices alone rise ~15–20%, so only beyond that is real growth
    const yearly = (average(n.months) * 12) / n.lastYearSales - 1 - 0.18;
    change = (change + yearly) / 2;
  }
  if (change >= 0.08) return "growing";
  if (change <= -0.08) return "shrinking";
  return "keeping-up";
}

// ---------- the full valuation ----------

export type Method = {
  key: "comparison" | "income" | "assets";
  label: string;
  used: boolean;
  value: number;
  weight: number;
  /** one line on what it is, in plain words */
  what: string;
  /** why it was used or left out */
  note: string;
};

export type Boost = { key: string; label: string; gain: number; href: string };

export type Valuation =
  | { stage: "none" }
  | { stage: "first-look"; low: number; mid: number; high: number; confidence: number }
  | {
      stage: "full";
      low: number;
      mid: number;
      high: number;
      confidence: number;
      yearlySales: number;
      yearlyLeft: number;
      multiple: number;
      reasons: Step[];
      methods: Method[];
      discountRate: number | null;
      afterDebts: number;
      trend: Trend;
    };

export function modelAnswered(m: Model) {
  return MODEL_KEYS.filter((k) => {
    const v = m[k];
    return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "";
  }).length;
}

/** what's been given and backed up, out of 100 */
export function confidenceOf(f: Pick<OwnerFile, "basics" | "numbers" | "model" | "docs">) {
  let s = 0;
  if (f.basics) s += 20;
  if (f.numbers) {
    s += 25;
    if (f.numbers.records === "bank") s += 10;
    else if (f.numbers.records === "some") s += 5;
    if (f.numbers.lastYearSales) s += 8;
  }
  s += Math.round((modelAnswered(f.model) / MODEL_KEYS.length) * 15);
  if (f.docs.some((d) => d.kind === "bank")) s += 15;
  const others = f.docs.filter((d) => d.kind !== "bank").length;
  if (others >= 3) s += 7;
  else if (others > 0) s += 4;
  return Math.min(100, s);
}

export function confidenceLabel(score: number) {
  if (score < 35) return "Low";
  if (score < 60) return "Medium";
  if (score < 80) return "Good";
  return "High";
}

/** the range: ±38% when we know only the basics, down to ±12% for a full, backed-up file */
export const spreadFor = (score: number) => 0.45 - 0.33 * (score / 100);

/** what to add next to be surer, biggest gain first */
export function boosts(f: Pick<OwnerFile, "basics" | "numbers" | "model" | "docs">): Boost[] {
  const out: Boost[] = [];
  if (!f.basics) out.push({ key: "basics", label: "Tell us the basics", gain: 20, href: "/app/file/basics" });
  if (!f.numbers) out.push({ key: "numbers", label: "Add your sales and costs", gain: 25, href: "/app/file/numbers" });
  if (!f.docs.some((d) => d.kind === "bank"))
    out.push({ key: "bank", label: "Add 6 months of bank statements", gain: 15, href: "/app/documents?kind=bank" });
  const left = MODEL_KEYS.length - modelAnswered(f.model);
  if (left > 0)
    out.push({
      key: "model",
      label: `Finish how you make money (${left} question${left === 1 ? "" : "s"} left)`,
      gain: Math.round((left / MODEL_KEYS.length) * 15),
      href: "/app/file/model",
    });
  if (f.numbers && !f.numbers.lastYearSales)
    out.push({ key: "lastyear", label: "Add last year's sales, even rough", gain: 8, href: "/app/file/numbers" });
  if (f.docs.filter((d) => d.kind !== "bank").length < 3)
    out.push({ key: "docs", label: "Add POS slips, receipts or a stock list", gain: 7, href: "/app/documents" });
  return out.sort((a, b) => b.gain - a.gain);
}

export function valuate(f: Pick<OwnerFile, "basics" | "numbers" | "model" | "docs">): Valuation {
  if (!f.basics) return { stage: "none" };
  const confidence = confidenceOf(f);
  if (!f.numbers) return { stage: "first-look", ...firstLook(f.basics), confidence };

  const b = f.basics;
  const n = f.numbers;
  const m = f.model;
  const sector = sectorOf(b.sector);
  const { sales, left } = monthly(n);
  const yearlySales = average(sales) * 12;
  const yearlyLeft = average(left) * 12;
  const trend = trendOf(n);
  const tenure = YEARS_TENURE[b.years];

  const reasons: Step[] = [];
  const add = (label: string, delta: number, why: string) => reasons.push({ label, delta, why });

  // the quick estimate's adjustments, now on real figures
  if (yearlyLeft < 6_000_000) add("Small earnings", -0.2, "Under ₦500k a month left; small businesses sell for less");
  else if (yearlyLeft >= 120_000_000) add("Larger business", 0.6, "Over ₦10M a month left; buyers pay more for scale");
  else if (yearlyLeft >= 36_000_000) add("Mid-sized business", 0.3, "Over ₦3M a month left; more buyers can see the value");
  if (tenure === "new") add("Under 2 years", -0.4, "A short track record is a bigger risk for a buyer");
  else if (tenure === "established") add("5+ years trading", 0.3, "A long track record makes the earnings believable");
  if (trend === "shrinking") add("Sales shrinking", -0.4, "Buyers price in the fall continuing");
  else if (trend === "growing") add("Growing faster than prices", 0.4, "Real growth, not just inflation");
  if (n.records === "cash") add("Mostly cash, few records", -0.2, "Earnings a buyer can't check are worth less");
  else if (n.records === "bank") add("Sales go through the bank", 0.1, "A buyer can check the earnings");

  // the business-model answers: each one shows a risk a buyer would price in
  if (m.withoutYou === "no") add("Depends on you", -0.4, "If it stops without you, a buyer is buying a job, not a business");
  else if (m.withoutYou === "yes") add("Runs without you", 0.3, "A buyer can take over without losing the customers");
  if (m.bigCustomer === "half") add("One customer is half your sales", -0.3, "Lose them and half the business goes with them");
  else if (m.bigCustomer === "little") add("No customer you can't lose", 0.1, "Sales are spread across many buyers");
  if (m.repeat === "most") add("Customers come back", 0.2, "Repeat sales are the easiest to count on");
  else if (m.repeat === "new") add("Mostly new customers each time", -0.2, "Sales have to be won again every month");
  if (m.supplier === "badly") add("Relies on one supplier", -0.3, "If they stop selling to you, the business stops");
  if (m.streams === "many") add("Several ways money comes in", 0.1, "One slow line doesn't sink the month");
  if (m.mustHave === "person") add("Relies on one key person", -0.2, "If they leave, a buyer loses what makes it work");
  if (m.premises === "short") add("Short or no lease", -0.1, "The location, and its customers, could be lost");
  else if (m.premises === "own") add("Owns its premises", 0.1, "No landlord can move it on");

  const raw = sector.multiple + reasons.reduce((t, s) => t + s.delta, 0);
  const multiple = Math.min(4.5, Math.max(1, Math.round(raw * 10) / 10));

  // 1. comparison
  const salesCeiling = yearlySales * sector.salesCap;
  let comparison = Math.max(0, yearlyLeft) * multiple;
  const capped = salesCeiling > 0 && comparison > salesCeiling;
  if (capped) comparison = salesCeiling;

  // 2. income: earnings after paying someone to run it, capitalised at a rate built from Nigeria's
  const managerWage = Math.min(1_500_000, Math.max(150_000, (yearlySales / 12) * 0.1)) * 12;
  const normalised = yearlyLeft - managerWage;
  const specific = Math.min(0.1, reasons.filter((r) => r.delta < 0).length * 0.02);
  const discountRate = RISK_FREE + EQUITY_PREMIUM + SMALL_BUSINESS_PREMIUM + specific;
  const incomeOk = tenure !== "new" && !!n.lastYearSales && normalised > 0;
  const incomeRaw = incomeOk ? (normalised * (1 + LONG_RUN_GROWTH)) / (discountRate - LONG_RUN_GROWTH) : 0;
  const income = salesCeiling > 0 ? Math.min(incomeRaw, salesCeiling) : incomeRaw;

  // 3. assets
  const assets = Math.max(0, n.equipment) + Math.max(0, n.stock) * STOCK_RECOVERY;

  const methods: Method[] = [
    {
      key: "comparison",
      label: "What similar businesses sell for",
      used: comparison > 0,
      value: comparison,
      weight: comparison > 0 ? 1 : 0,
      what: `What's left for you a year × ${multiple.toFixed(1)}, what buyers typically pay in ${sector.label.toLowerCase()}`,
      note:
        comparison <= 0
          ? "Nothing is left at the end of the month yet, so a buyer would pay for what it owns instead"
          : capped
            ? `Capped at ${Math.round(sector.salesCap * 100)}% of a year's sales: buyers in this trade rarely pay more`
            : "The main method for small businesses, used by brokers",
    },
    {
      key: "income",
      label: "What it should earn from here",
      used: incomeOk,
      value: income,
      weight: incomeOk ? 0.5 : 0,
      what: `Earnings after paying a manager, at a ${Math.round(discountRate * 100)}% return a buyer would want in Nigeria`,
      note: incomeOk
        ? "Used because you have two or more years of believable sales"
        : tenure === "new"
          ? "Left out until the business has two years of history"
          : !n.lastYearSales
            ? "Left out until you add last year's sales"
            : "Left out: after paying a manager, too little is left to count on",
    },
    {
      key: "assets",
      label: "What it owns",
      used: assets > 0,
      value: assets,
      weight: assets > 0 ? 0.25 : 0,
      what: "Equipment at what it would sell for today, plus stock at 80% of its cost",
      note: "The floor: the business is never worth less than this",
    },
  ];

  const totalWeight = methods.reduce((t, x) => t + x.weight, 0);
  const blended = totalWeight > 0 ? methods.reduce((t, x) => t + x.value * x.weight, 0) / totalWeight : 0;
  const mid = Math.max(blended, assets);
  const spread = spreadFor(confidence);

  return {
    stage: "full",
    low: nice(mid * (1 - spread)),
    mid: nice(mid),
    high: nice(mid * (1 + spread)),
    confidence,
    yearlySales,
    yearlyLeft,
    multiple,
    reasons,
    methods,
    discountRate: incomeOk ? discountRate : null,
    afterDebts: nice(Math.max(0, mid + Math.max(0, n.cash) - Math.max(0, n.owed))),
    trend,
  };
}
