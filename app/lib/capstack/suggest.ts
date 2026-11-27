import type { SectorKey } from "../quickEstimate";
import { nice } from "./engine";
import { naira } from "./format";
import type { Basics } from "./types";

/* Estimates we can offer the owner from what they've already told us, so nobody has to be an accountant to answer.
   Each is a rough rule for the trade, said plainly, and the owner can take it or type their own. Only for
   questions earlier answers can genuinely answer; never for what only the owner can know (equipment, cash, debts).

   Typical shares by trade (sources and confidence for each: docs/valuation-benchmarks.md). Food, shops and
   pharmacies are set from published sector benchmarks; the rest are reasoned from cost structure and still need
   checking against real Nigerian files:
   - kept: what's left for the owner out of each ₦1 of sales
   - fixed: the part of monthly costs that doesn't move with sales (rent, salaries)
   - stockMonths: stock usually on hand, in months of the costs that move with sales */
export const TRADE: Record<SectorKey, { kept: number; fixed: number; stockMonths: number; noun: string }> = {
  food: { kept: 0.15, fixed: 0.45, stockMonths: 0.25, noun: "food businesses" },
  trade: { kept: 0.1, fixed: 0.15, stockMonths: 1, noun: "shops and traders" },
  beauty: { kept: 0.3, fixed: 0.45, stockMonths: 1, noun: "fashion and beauty businesses" },
  services: { kept: 0.35, fixed: 0.65, stockMonths: 0, noun: "service businesses" },
  health: { kept: 0.12, fixed: 0.15, stockMonths: 1.2, noun: "pharmacies" },
  education: { kept: 0.3, fixed: 0.7, stockMonths: 0, noun: "schools" },
  construction: { kept: 0.2, fixed: 0.3, stockMonths: 0.5, noun: "building businesses" },
  logistics: { kept: 0.15, fixed: 0.4, stockMonths: 0, noun: "transport businesses" },
  making: { kept: 0.25, fixed: 0.35, stockMonths: 1, noun: "makers" },
  tech: { kept: 0.4, fixed: 0.75, stockMonths: 0, noun: "tech businesses" },
};

export type Suggestion = { value: number; why: string };

type Known = { basics: Basics | null; answers: Record<string, unknown> };

const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : null);

export function suggestFor(questionId: string, { basics, answers }: Known): Suggestion | null {
  const months = Array.isArray(answers.months) && answers.months.every((m) => typeof m === "number") ? (answers.months as number[]) : null;
  const lastSales = months ? months[months.length - 1] : null;
  const t = basics ? TRADE[basics.sector] : null;

  switch (questionId) {
    case "lastMonthCosts": {
      if (!lastSales || !t) return null;
      return {
        value: nice(lastSales * (1 - t.kept)),
        why: `${cap(t.noun)} usually keep about ${pct(t.kept)} of what comes in, so out of ${naira(lastSales)} about this much goes out.`,
      };
    }
    case "fixedCosts": {
      const costs = num(answers.lastMonthCosts);
      if (!costs || !t) return null;
      return {
        value: nice(costs * t.fixed),
        why: `For ${t.noun}, about ${pct(t.fixed)} of costs stay the same every month (rent, salaries).`,
      };
    }
    case "lastYearSales": {
      if (!months) return null;
      const avg = months.reduce((a, b) => a + b, 0) / months.length;
      return { value: nice(avg * 12), why: "Your last six months, times two, if they were typical months." };
    }
    case "stock": {
      const costs = num(answers.lastMonthCosts);
      if (!costs || !t || t.stockMonths === 0) return null;
      const moving = costs - (num(answers.fixedCosts) ?? costs * t.fixed);
      if (moving <= 0) return null;
      return {
        value: nice(moving * t.stockMonths),
        why: `${cap(t.noun)} usually hold about ${t.stockMonths < 1 ? `${Math.round(t.stockMonths * 30)} days` : `${t.stockMonths} month${t.stockMonths === 1 ? "" : "s"}`} of stock, going by what you spend on it.`,
      };
    }
    default:
      return null;
  }
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
