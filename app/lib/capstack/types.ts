import type { OwnerReliance, Records, SectorKey } from "../quickEstimate";

/* An owner's file: everything Capstack knows about one business, as the owner gave it. Saved in the browser for
   now (store.ts); the shapes are what a server will store later. */

export type Purpose = "curious" | "sell" | "loan" | "invest" | "other";

export type YearsBand = "lt1" | "1-2" | "2-5" | "5-10" | "10+";
export type SalesBand = "lt500k" | "500k-2m" | "2m-5m" | "5m-20m" | "gt20m";

/** Chapter 01: the basics a buyer asks first. */
export type Basics = {
  businessName: string;
  sector: SectorKey;
  city: string;
  years: YearsBand;
  people: number;
  salesBand: SalesBand;
};

/** Chapter 02: sales, costs, what it owns and owes. Monthly figures in Naira. */
export type Numbers = {
  /** the last six months' sales, oldest first; the last one is last month */
  months: number[];
  /** everything that went out last month, not counting what the owner paid themselves */
  lastMonthCosts: number;
  /** the part of those costs that stays the same even in a slow month (rent, salaries) */
  fixedCosts: number;
  /** all of last year's sales, if the owner knows it roughly */
  lastYearSales: number | null;
  /** what the equipment, vehicles and fittings would sell for today */
  equipment: number;
  stock: number;
  cash: number;
  /** loans, supplier debts, anything the business owes */
  owed: number;
  records: Records;
  /** answers that are exactly the estimate we offered (the owner tapped "Use"): they count as rough, not as known */
  estimated?: string[];
};

/** Chapter 03: how the business makes money, asked as plain questions. Each answer can move the value. */
export type Model = Partial<{
  bigCustomer: "little" | "quarter" | "half";
  repeat: "most" | "some" | "new";
  supplier: "fine" | "while" | "badly";
  withoutYou: OwnerReliance;
  edge: string;
  channels: string[];
  streams: "one" | "few" | "many";
  mustHave: "location" | "equipment" | "licence" | "person" | "nothing";
  premises: "own" | "long" | "short" | "none";
}>;

export const MODEL_KEYS = [
  "bigCustomer",
  "repeat",
  "supplier",
  "withoutYou",
  "edge",
  "channels",
  "streams",
  "mustHave",
  "premises",
] as const;

export type DocKind = "bank" | "pos" | "receipts" | "stock" | "other";

export type Doc = { id: string; kind: DocKind; name: string; size: number; addedAt: string };

export type OwnerFile = {
  name: string;
  email: string;
  purpose: Purpose | null;
  basics: Basics | null;
  numbers: Numbers | null;
  model: Model;
  docs: Doc[];
  /** when each chapter was last saved: the file is kept up to date over time, not filled once */
  chapterUpdatedAt?: Partial<Record<"basics" | "numbers" | "model", string>>;
  /** ids of Sarah's findings the owner has seen (clears the notification bar) */
  seenInsights?: string[];
  /** whether the owner lets Capstack use their figures, without their name, to build benchmarks */
  consent?: { benchmarks: boolean; at: string };
  /** a random id the anonymised record goes under, so an updated file replaces its earlier record */
  benchmarkId?: string;
  createdAt: string;
  updatedAt: string;
};
