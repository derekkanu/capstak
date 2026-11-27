import type { Basics, Doc, Model, Numbers } from "./types";

/* A complete example file, for previewing the dashboard and report with everything provided (testing only). */

export const SAMPLE_BASICS: Basics = {
  businessName: "Mama Nkechi's Kitchen",
  sector: "food",
  city: "Enugu",
  years: "5-10",
  people: 9,
  salesBand: "500k-2m",
};

export const SAMPLE_NUMBERS: Numbers = {
  months: [1_300_000, 1_400_000, 1_500_000, 1_400_000, 1_500_000, 1_650_000],
  lastMonthCosts: 1_200_000,
  fixedCosts: 400_000,
  lastYearSales: 14_500_000,
  equipment: 2_500_000,
  stock: 1_100_000,
  cash: 300_000,
  owed: 600_000,
  records: "bank",
};

export const SAMPLE_MODEL: Model = {
  bigCustomer: "quarter",
  repeat: "most",
  supplier: "fine",
  withoutYou: "partly",
  edge: "Our jollof, and we deliver to offices on time",
  channels: ["walk-in", "whatsapp", "contracts"],
  streams: "few",
  mustHave: "location",
  premises: "long",
};

export function sampleDocs(now = new Date().toISOString()): Doc[] {
  return [
    { id: "s1", kind: "bank", name: "Bank statement Jun–Nov.pdf", size: 412_000, addedAt: now },
    { id: "s2", kind: "pos", name: "POS slips October.jpg", size: 1_800_000, addedAt: now },
    { id: "s3", kind: "receipts", name: "Supplier invoices.pdf", size: 640_000, addedAt: now },
    { id: "s4", kind: "stock", name: "Stock list.xlsx", size: 38_000, addedAt: now },
  ];
}
