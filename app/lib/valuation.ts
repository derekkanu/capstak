/**
 * Shared types + the deterministic valuation engine.
 *
 * The AI conducts the conversation and, when it has gathered enough, emits a
 * `ValuationInput` via tool use. The number itself is computed here — in plain
 * TypeScript — so the result is consistent and explainable rather than
 * something the model makes up turn to turn.
 */

export type GrowthTrend = "increasing" | "steady" | "decreasing";

export type ValuationInput = {
  businessName: string | null;
  industry: string | null;
  location: string | null;
  yearsInOperation: number | null;
  /** Raw monthly figures the user gave, kept for the report. */
  revenueThreeMonthsAgo: number | null;
  revenueLastMonth: number | null;
  /** Annualized estimates (the model annualizes the monthly figures). */
  annualRevenue: number | null;
  annualNetProfit: number | null;
  costStructure: string | null;
  liabilities: number | null;
  growthTrend: GrowthTrend | null;
  growthRatePct: number | null;
  competitors: string | null;
  marketSize: string | null;
  customerSegments: string | null;
  teamSize: number | null;
  keyAssets: string | null;
  keyProcesses: string | null;
  risks: string | null;
  growthStrategy: string | null;
  contingencyPlans: string | null;
};

export type Adjustment = { label: string; delta: number };

export type ValuationResult = {
  low: number;
  mid: number;
  high: number;
  currency: string;
  annualRevenue: number;
  annualNetProfit: number;
  netMargin: number;
  liabilities: number;
  baseMultiple: number;
  adjustedMultiple: number;
  earningsValue: number;
  revenueValue: number;
  industryLabel: string;
  adjustments: Adjustment[];
};

/** The intake script, grouped into stages. Drives the report + the mock flow. */
export const INTAKE_STAGES: { title: string; questions: string[] }[] = [
  {
    title: "Business Overview",
    questions: [
      "What is the name of your business?",
      "In what industry does your business operate?",
      "Where is your business located — city and country?",
      "How many years have you been running this business?",
    ],
  },
  {
    title: "Financials",
    questions: [
      "Roughly what was your revenue three months ago?",
      "And what was your revenue last month?",
      "What was your net profit over the same period?",
      "Can you describe your major costs — like production, marketing, or operations?",
      "Do you have any outstanding debts or liabilities we should consider?",
      "Over the past few months, is your revenue increasing, staying the same, or decreasing — and by roughly how much?",
    ],
  },
  {
    title: "Market Context",
    questions: [
      "Who do you see as your top competitors?",
      "How large is your market — can you estimate your total addressable market?",
      "Who are your main customers — small businesses, individuals, or other types?",
    ],
  },
  {
    title: "Operations",
    questions: [
      "How many employees or team members do you currently have?",
      "What are your most valuable assets — like intellectual property, equipment, or unique technology?",
      "What are your main business operations — like production, service delivery, or customer support?",
    ],
  },
  {
    title: "Risks & Strategy",
    questions: [
      "What would you say are the biggest risks your business faces today?",
      "What strategies do you have in mind to grow your business?",
      "If your revenue dropped, do you have a plan for how you'd respond?",
    ],
  },
];

/** EBITDA / SDE earnings multiples by sector keyword (rough industry norms). */
const INDUSTRY_MULTIPLES: { keys: string[]; multiple: number; revMultiple: number; label: string }[] = [
  { keys: ["saas", "software", "b2b software"], multiple: 4.6, revMultiple: 2.4, label: "Software / SaaS" },
  { keys: ["tech", "technology", "ai", "app"], multiple: 4.0, revMultiple: 1.8, label: "Technology" },
  { keys: ["ecommerce", "e-commerce", "online store", "dtc"], multiple: 2.9, revMultiple: 0.9, label: "E-commerce" },
  { keys: ["retail", "shop", "store"], multiple: 2.4, revMultiple: 0.6, label: "Retail" },
  { keys: ["restaurant", "cafe", "food", "hospitality", "bar"], multiple: 2.1, revMultiple: 0.5, label: "Food & Hospitality" },
  { keys: ["manufactur", "factory", "industrial"], multiple: 3.3, revMultiple: 0.9, label: "Manufacturing" },
  { keys: ["construction", "contractor", "trades"], multiple: 2.6, revMultiple: 0.6, label: "Construction" },
  { keys: ["health", "clinic", "medical", "dental", "wellness"], multiple: 3.6, revMultiple: 1.1, label: "Healthcare" },
  { keys: ["consult", "agency", "marketing", "professional service"], multiple: 2.7, revMultiple: 0.9, label: "Professional Services" },
  { keys: ["service", "services", "maintenance", "repair"], multiple: 2.8, revMultiple: 0.8, label: "Services" },
  { keys: ["finance", "fintech", "insurance", "accounting"], multiple: 3.5, revMultiple: 1.4, label: "Finance" },
  { keys: ["education", "training", "course", "school"], multiple: 2.9, revMultiple: 1.0, label: "Education" },
  { keys: ["logistics", "transport", "delivery", "freight"], multiple: 2.8, revMultiple: 0.7, label: "Logistics" },
  { keys: ["real estate", "property", "realty"], multiple: 3.0, revMultiple: 1.6, label: "Real Estate" },
];

const DEFAULT_SECTOR = { multiple: 3.0, revMultiple: 0.9, label: "General Business" };

function sectorFor(industry: string | null) {
  if (!industry) return DEFAULT_SECTOR;
  const q = industry.toLowerCase();
  for (const s of INDUSTRY_MULTIPLES) {
    if (s.keys.some((k) => q.includes(k))) return s;
  }
  return DEFAULT_SECTOR;
}

function round(n: number, to = 1000) {
  return Math.max(0, Math.round(n / to) * to);
}

/**
 * Turn the collected inputs into a defensible valuation range. Enterprise value
 * is driven primarily by annualized earnings × an industry multiple, adjusted
 * for growth, tenure and margin, then blended with a revenue cross-check and
 * netted against liabilities.
 */
export function computeValuation(input: ValuationInput): ValuationResult {
  const sector = sectorFor(input.industry);

  // Annual revenue: use the model's annualized figure, else annualize the
  // monthly numbers, else fall back to whatever single figure we have.
  let annualRevenue = input.annualRevenue ?? 0;
  if (!annualRevenue) {
    const m3 = input.revenueThreeMonthsAgo ?? 0;
    const m1 = input.revenueLastMonth ?? 0;
    const avgMonthly = m3 && m1 ? (m3 + m1) / 2 : m1 || m3;
    annualRevenue = avgMonthly * 12;
  }

  // Net profit: model's annualized figure, else assume a sector-typical margin.
  let annualNetProfit = input.annualNetProfit ?? 0;
  if (!annualNetProfit && annualRevenue) {
    annualNetProfit = annualRevenue * 0.15;
  }

  const netMargin = annualRevenue ? annualNetProfit / annualRevenue : 0;
  const liabilities = input.liabilities ?? 0;

  // Multiple adjustments.
  const adjustments: Adjustment[] = [];
  let adjusted = sector.multiple;

  if (input.growthTrend === "increasing") {
    adjustments.push({ label: "Revenue growing", delta: 0.5 });
    adjusted += 0.5;
  } else if (input.growthTrend === "decreasing") {
    adjustments.push({ label: "Revenue declining", delta: -0.5 });
    adjusted -= 0.5;
  }

  if ((input.yearsInOperation ?? 0) >= 5) {
    adjustments.push({ label: "Established track record (5+ yrs)", delta: 0.3 });
    adjusted += 0.3;
  } else if ((input.yearsInOperation ?? 99) < 2) {
    adjustments.push({ label: "Early stage (under 2 yrs)", delta: -0.4 });
    adjusted -= 0.4;
  }

  if (netMargin >= 0.2) {
    adjustments.push({ label: "Strong profit margin", delta: 0.3 });
    adjusted += 0.3;
  } else if (netMargin > 0 && netMargin < 0.05) {
    adjustments.push({ label: "Thin profit margin", delta: -0.3 });
    adjusted -= 0.3;
  }

  if (liabilities > 0 && annualNetProfit > 0 && liabilities > annualNetProfit * 2) {
    adjustments.push({ label: "Elevated debt load", delta: -0.3 });
    adjusted -= 0.3;
  }

  const adjustedMultiple = Math.max(0.8, Math.round(adjusted * 10) / 10);

  const earningsValue = Math.max(0, annualNetProfit) * adjustedMultiple;
  const revenueValue = annualRevenue * sector.revMultiple;

  // Blend earnings and revenue views, then net out debt.
  const enterprise =
    annualNetProfit > 0 ? earningsValue * 0.7 + revenueValue * 0.3 : revenueValue * 0.6;
  const equity = Math.max(0, enterprise - liabilities);

  return {
    low: round(equity * 0.85),
    mid: round(equity),
    high: round(equity * 1.15),
    currency: "USD",
    annualRevenue: round(annualRevenue),
    annualNetProfit: round(annualNetProfit),
    netMargin,
    liabilities: round(liabilities),
    baseMultiple: sector.multiple,
    adjustedMultiple,
    earningsValue: round(earningsValue),
    revenueValue: round(revenueValue),
    industryLabel: sector.label,
    adjustments,
  };
}

export function formatCurrency(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
