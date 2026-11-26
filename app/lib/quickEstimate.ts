/**
 * The free quick estimate (home page calculator). One method, done properly: the market (comparison) method on
 * what the business leaves its owner each year, the way small businesses actually change hands.
 *
 *   value = what's left for the owner a year × a multiple for the trade, adjusted for size, age, growth,
 *           how much it depends on the owner and how good the records are
 *   then checked against sales: buyers in a trade rarely pay more than a set share of a year's sales
 *
 * Where the benchmarks come from (starting points, to be calibrated with Nigerian brokers' closed deals):
 * - Small-business sale data (BizBuySell 2025): about 2.6× earnings on average; food ~2.3×, retail ~2.6–2.7×,
 *   services ~2.6×; revenue multiples food ~0.41×, retail ~0.54×, services ~0.82×. Smaller deals sell lower
 *   (BIZCOMPS: ~1.5× under $300k sales vs ~2.2× above $700k).
 * - Nigeria carries more risk (T-bills ~15–17% vs ~4% in the US, FX, power, thinner buyer pool), so the
 *   earnings multiples are taken about 20% lower. Established African SMEs sell around 2.5–5.5× normalised
 *   earnings, which the larger size bands move toward.
 * - Buyers discount heavily when the business depends on its founder, and pay more for clean records.
 *
 * "What's left for you" is profit before paying yourself (most owners here don't take a salary), which is
 * the figure small-business multiples are quoted on. Debts are not included: the value is before debts.
 */

export type Trend = "shrinking" | "keeping-up" | "growing";
export type Tenure = "new" | "mid" | "established";
export type OwnerReliance = "no" | "partly" | "yes"; // could it run a month without you?
export type Records = "cash" | "some" | "bank";

export const SECTORS = [
  { key: "food", label: "Food & drinks", multiple: 1.9, salesCap: 0.4 },
  { key: "trade", label: "Shop & trading", multiple: 2.0, salesCap: 0.5 },
  { key: "beauty", label: "Fashion & beauty", multiple: 1.8, salesCap: 0.6 },
  { key: "services", label: "Services", multiple: 2.1, salesCap: 0.8 },
  { key: "health", label: "Health & pharmacy", multiple: 2.6, salesCap: 0.8 },
  { key: "education", label: "Schools & training", multiple: 2.5, salesCap: 1.0 },
  { key: "construction", label: "Building & construction", multiple: 2.0, salesCap: 0.5 },
  { key: "logistics", label: "Transport & logistics", multiple: 2.0, salesCap: 0.6 },
  { key: "making", label: "Making things", multiple: 2.4, salesCap: 0.7 },
  { key: "tech", label: "Tech & software", multiple: 2.8, salesCap: 1.5 },
] as const;

export type SectorKey = (typeof SECTORS)[number]["key"];

export type QuickInput = {
  sector: SectorKey;
  monthlySales: number;
  monthlyLeft: number; // what's left for the owner each month, before paying themselves
  tenure: Tenure;
  trend: Trend;
  withoutYou: OwnerReliance;
  records: Records;
};

export type Step = { label: string; delta: number; why: string };

export type QuickResult =
  | { ok: false; reason: string; sector: (typeof SECTORS)[number] }
  | {
      ok: true;
      sector: (typeof SECTORS)[number];
      yearlySales: number;
      yearlyLeft: number;
      steps: Step[];
      multiple: number;
      earningsValue: number; // yearlyLeft × multiple
      salesCeiling: number; // yearlySales × the trade's cap
      capped: boolean;
      mid: number;
      low: number;
      high: number;
      spread: number; // ± share used for the range
      confidence: "Low" | "Fair" | "Good";
    };

// rounds to 2 significant figures: an estimate should not look more exact than it is
function nice(n: number) {
  if (n <= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}

export function quickEstimate(i: QuickInput): QuickResult {
  const sector = SECTORS.find((s) => s.key === i.sector) ?? SECTORS[3];
  const yearlySales = Math.max(0, i.monthlySales) * 12;
  const yearlyLeft = i.monthlyLeft * 12;

  if (yearlyLeft <= 0)
    return {
      ok: false,
      sector,
      reason:
        "When nothing is left at the end of the month, a buyer pays for the equipment and stock, not the profit. The full valuation counts those.",
    };

  const steps: Step[] = [];
  const add = (label: string, delta: number, why: string) => steps.push({ label, delta, why });

  // size: smaller businesses sell for less; bigger, established ones move toward 2.5–5.5×
  if (yearlyLeft < 6_000_000) add("Small earnings", -0.2, "Under ₦500k a month left; small businesses sell for less");
  else if (yearlyLeft >= 120_000_000) add("Larger business", 0.6, "Over ₦10M a month left; buyers pay more for scale");
  else if (yearlyLeft >= 36_000_000) add("Mid-sized business", 0.3, "Over ₦3M a month left; more buyers can see the value");

  if (i.tenure === "new") add("Under 2 years", -0.4, "A short track record is a bigger risk for a buyer");
  else if (i.tenure === "established") add("5+ years trading", 0.3, "A long track record makes the earnings believable");

  if (i.trend === "shrinking") add("Sales shrinking", -0.4, "Buyers price in the fall continuing");
  else if (i.trend === "growing") add("Growing faster than prices", 0.4, "Real growth, not just inflation");

  if (i.withoutYou === "no") add("Depends on you", -0.4, "If it stops without you, a buyer is buying a job, not a business");
  else if (i.withoutYou === "yes") add("Runs without you", 0.3, "A buyer can take over without losing the customers");

  if (i.records === "cash") add("Mostly cash, few records", -0.2, "Earnings a buyer can't check are worth less");

  const raw = sector.multiple + steps.reduce((t, s) => t + s.delta, 0);
  const multiple = Math.min(4, Math.max(1, Math.round(raw * 10) / 10));

  const earningsValue = yearlyLeft * multiple;
  const salesCeiling = yearlySales * sector.salesCap;
  const capped = salesCeiling > 0 && earningsValue > salesCeiling;
  const value = capped ? salesCeiling : earningsValue;

  // the range is honest about how little a quick estimate knows: wider with fewer records or a short history
  let spread = i.records === "bank" ? 0.2 : i.records === "some" ? 0.27 : 0.35;
  if (i.tenure === "new") spread += 0.05;
  const confidence = spread <= 0.2 ? "Good" : spread <= 0.3 ? "Fair" : "Low";

  return {
    ok: true,
    sector,
    yearlySales,
    yearlyLeft,
    steps,
    multiple,
    earningsValue,
    salesCeiling,
    capped,
    mid: nice(value),
    low: nice(value * (1 - spread)),
    high: nice(value * (1 + spread)),
    spread,
    confidence,
  };
}
