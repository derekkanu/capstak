import { monthly } from "./engine";
import type { OwnerFile, SalesBand, YearsBand } from "./types";

/* The anonymised record a file contributes to Capstack's own benchmarks, only with the owner's consent. It holds
   categories and ratios, never anything that names a person or a business: no name, email, business name, exact
   figures, or the owner's own words. Cities outside the largest few are grouped, so a rare trade in a small town
   can't be picked out. These records are what will, over time, replace the borrowed benchmarks with African ones. */

const BIG_CITIES = ["lagos", "abuja", "port harcourt", "ibadan", "kano", "enugu", "benin city", "aba", "onitsha", "kaduna"];

export type BenchmarkRecord = {
  v: 1;
  id: string; // a random id for the file, so an updated file replaces its earlier record
  month: string; // YYYY-MM the record was made
  purpose: string | null;
  sector: string;
  city: string; // one of the big cities, or "other"
  years: YearsBand;
  people: "1-2" | "3-9" | "10-49" | "50+";
  salesBand: SalesBand;
  kept: number | null; // what's left per ₦1 of sales, 2 decimals
  fixedShare: number | null; // share of costs that stay the same
  stockMonths: number | null; // stock held, in months of the costs that move with sales
  swing: number | null; // (best − slowest month) / average month
  owedToYearLeft: number | null;
  records: string | null;
  estimated: string[]; // which answers were our estimates, so they can be left out
  model: Record<string, string | number>; // the business-model choices (never the free-text answer)
  docs: Record<string, number>; // how many of each kind
};

const r2 = (x: number) => Math.round(x * 100) / 100;

export function toBenchmarkRecord(f: OwnerFile, id: string, now = new Date()): BenchmarkRecord | null {
  if (!f.basics) return null;
  const b = f.basics;
  const city = BIG_CITIES.includes(b.city.trim().toLowerCase()) ? b.city.trim().toLowerCase() : "other";
  const people = b.people <= 2 ? "1-2" : b.people <= 9 ? "3-9" : b.people <= 49 ? "10-49" : "50+";

  let kept = null,
    fixedShare = null,
    stockMonths = null,
    swing = null,
    owedToYearLeft = null;
  if (f.numbers) {
    const { sales, left } = monthly(f.numbers);
    const avg = (xs: number[]) => xs.reduce((a, c) => a + c, 0) / xs.length;
    const avgSales = avg(sales);
    const yearLeft = avg(left) * 12;
    if (avgSales > 0) {
      kept = r2(avg(left) / avgSales);
      swing = r2((Math.max(...sales) - Math.min(...sales)) / avgSales);
    }
    if (f.numbers.lastMonthCosts > 0) {
      const fixed = Math.min(f.numbers.fixedCosts, f.numbers.lastMonthCosts);
      fixedShare = r2(fixed / f.numbers.lastMonthCosts);
      const moving = f.numbers.lastMonthCosts - fixed;
      if (moving > 0) stockMonths = r2(f.numbers.stock / moving);
    }
    if (yearLeft > 0) owedToYearLeft = r2(f.numbers.owed / yearLeft);
  }

  const model: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(f.model)) {
    if (k === "edge") continue; // the owner's own words never leave their file
    if (Array.isArray(v)) model[k] = v.length;
    else if (typeof v === "string") model[k] = v;
  }
  const docs: Record<string, number> = {};
  for (const d of f.docs) docs[d.kind] = (docs[d.kind] ?? 0) + 1;

  return {
    v: 1,
    id,
    month: now.toISOString().slice(0, 7),
    purpose: f.purpose,
    sector: b.sector,
    city,
    years: b.years,
    people,
    salesBand: b.salesBand,
    kept,
    fixedShare,
    stockMonths,
    swing,
    owedToYearLeft,
    records: f.numbers?.records ?? null,
    estimated: f.numbers?.estimated ?? [],
    model,
    docs,
  };
}
