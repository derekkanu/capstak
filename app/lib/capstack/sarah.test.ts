import { describe, expect, test } from "bun:test";
import { chapters, nextStep, welcomeLine } from "./sarah";
import type { Basics, Numbers, OwnerFile } from "./types";

const basics: Basics = { businessName: "Okafor Woodworks", sector: "making", city: "Aba", years: "5-10", people: 6, salesBand: "2m-5m" };
const numbers: Numbers = {
  months: [3e6, 3.2e6, 3.1e6, 3.4e6, 3.3e6, 3.6e6],
  lastMonthCosts: 2.7e6,
  fixedCosts: 9e5,
  lastYearSales: 36e6,
  equipment: 6e6,
  stock: 2e6,
  cash: 5e5,
  owed: 1e6,
  records: "bank",
};
const fullModel = { bigCustomer: "little", repeat: "most", supplier: "fine", withoutYou: "partly", edge: "Quality", channels: ["referrals"], streams: "few", mustHave: "equipment", premises: "long" } as const;

const f = (over: Partial<OwnerFile> = {}): Pick<OwnerFile, "purpose" | "basics" | "numbers" | "model" | "docs"> => ({
  purpose: "sell",
  basics: null,
  numbers: null,
  model: {},
  docs: [],
  ...over,
});

describe("Sarah's next step", () => {
  test("walks basics → numbers → model → bank statements → report, one step at a time", () => {
    expect(nextStep(f()).key).toBe("basics");
    expect(nextStep(f({ basics })).key).toBe("numbers");
    expect(nextStep(f({ basics, numbers })).key).toBe("model");
    expect(nextStep(f({ basics, numbers, model: { ...fullModel, channels: [...fullModel.channels] } })).key).toBe("bank");
    const done = f({ basics, numbers, model: { ...fullModel, channels: [...fullModel.channels] }, docs: [{ id: "1", kind: "bank", name: "s.pdf", size: 1, addedAt: "" }] });
    expect(nextStep(done).key).toBe("report");
  });

  test("speaks to why they came", () => {
    expect(nextStep(f({ purpose: "loan" })).message).toContain("a lender");
    expect(nextStep(f({ purpose: "sell" })).message).toContain("a buyer");
    expect(welcomeLine("loan")).toContain("lender");
  });

  test("the first look message quotes the range", () => {
    expect(nextStep(f({ basics })).message).toMatch(/₦[\d.]+[Mk]?–/);
  });
});

describe("chapters", () => {
  test("the report stays locked until 01 to 03 are done", () => {
    expect(chapters(f({ basics, numbers })).find((c) => c.key === "report")?.status).toBe("locked");
    expect(chapters(f({ basics, numbers, model: { ...fullModel, channels: [...fullModel.channels] } })).find((c) => c.key === "report")?.status).toBe("done");
  });

  test("the numbers chapter says what documents back it", () => {
    const c = chapters(f({ basics, numbers })).find((x) => x.key === "numbers");
    expect(c?.detail).toContain("Not backed by documents yet");
  });
});
