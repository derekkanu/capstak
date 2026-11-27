import { describe, expect, test } from "bun:test";
import { boosts, confidenceOf, firstLook, monthly, nice, trendOf, valuate } from "./engine";
import type { Basics, Numbers, OwnerFile } from "./types";

const basics: Basics = { businessName: "Mama Nkechi's Kitchen", sector: "food", city: "Enugu", years: "5-10", people: 9, salesBand: "500k-2m" };

const numbers: Numbers = {
  months: [1_300_000, 1_400_000, 1_500_000, 1_400_000, 1_600_000, 1_500_000],
  lastMonthCosts: 1_150_000,
  fixedCosts: 400_000,
  lastYearSales: 14_000_000,
  equipment: 2_500_000,
  stock: 1_100_000,
  cash: 300_000,
  owed: 600_000,
  records: "some",
};

const file = (over: Partial<OwnerFile> = {}) => ({ basics, numbers, model: {}, docs: [], ...over });

describe("first look", () => {
  test("is a wide range from the trade and rough sales", () => {
    const r = firstLook(basics);
    expect(r.low).toBeLessThan(r.mid);
    expect(r.high).toBeGreaterThan(r.mid);
    expect(r.high / r.low).toBeGreaterThan(2.5);
  });

  test("a new business looks smaller than an established one", () => {
    expect(firstLook({ ...basics, years: "lt1" }).mid).toBeLessThan(firstLook(basics).mid);
  });
});

describe("monthly picture", () => {
  test("rebuilds each month's costs from last month's: fixed part stays, the rest moves with sales", () => {
    const m = monthly(numbers);
    expect(m.costs[5]).toBe(1_150_000);
    expect(m.costs[0]).toBeLessThan(m.costs[4]);
    expect(m.left[5]).toBe(350_000);
  });

  test("fixed costs never exceed last month's total", () => {
    const m = monthly({ ...numbers, fixedCosts: 5_000_000 });
    expect(m.costs[5]).toBe(1_150_000);
  });
});

describe("trend", () => {
  test("flat sales against last year (after inflation) read as keeping up or shrinking, not growing", () => {
    expect(trendOf({ ...numbers, months: Array(6).fill(1_000_000), lastYearSales: 12_000_000 })).not.toBe("growing");
  });
  test("a clear rise reads as growing", () => {
    expect(trendOf({ ...numbers, months: [1e6, 1e6, 1e6, 1.4e6, 1.5e6, 1.5e6], lastYearSales: null })).toBe("growing");
  });
});

describe("full valuation", () => {
  test("needs the basics; gives a first look before the numbers", () => {
    expect(valuate({ basics: null, numbers: null, model: {}, docs: [] }).stage).toBe("none");
    expect(valuate(file({ numbers: null })).stage).toBe("first-look");
  });

  test("same answers, same result", () => {
    expect(valuate(file())).toEqual(valuate(file()));
  });

  test("uses all three methods for an established business with last year's sales", () => {
    const v = valuate(file());
    if (v.stage !== "full") throw new Error("expected full");
    expect(v.methods.filter((m) => m.used).map((m) => m.key)).toEqual(["comparison", "income", "assets"]);
    expect(v.low).toBeLessThan(v.mid);
    expect(v.discountRate).toBeGreaterThan(0.3);
  });

  test("leaves the income method out without last year's sales", () => {
    const v = valuate(file({ numbers: { ...numbers, lastYearSales: null } }));
    if (v.stage !== "full") throw new Error("expected full");
    expect(v.methods.find((m) => m.key === "income")?.used).toBe(false);
  });

  test("never values the business below what it owns", () => {
    const v = valuate(file({ numbers: { ...numbers, lastMonthCosts: 1_500_000, equipment: 20_000_000 } }));
    if (v.stage !== "full") throw new Error("expected full");
    expect(v.mid).toBeGreaterThanOrEqual(nice(20_000_000 + 1_100_000 * 0.8) * 0.99);
  });

  test("risky answers lower the value, steady ones raise it", () => {
    const risky = valuate(file({ model: { withoutYou: "no", bigCustomer: "half", supplier: "badly" } }));
    const steady = valuate(file({ model: { withoutYou: "yes", repeat: "most", bigCustomer: "little" } }));
    if (risky.stage !== "full" || steady.stage !== "full") throw new Error("expected full");
    expect(risky.mid).toBeLessThan(steady.mid);
  });

  test("after debts adds cash and takes off what's owed", () => {
    const v = valuate(file());
    if (v.stage !== "full") throw new Error("expected full");
    expect(v.afterDebts).toBe(nice(v.mid + 300_000 - 600_000));
  });
});

describe("how sure we are", () => {
  test("rises as the file fills and documents back it up, and narrows the range", () => {
    const thin = file({ numbers: { ...numbers, records: "cash", lastYearSales: null } });
    const full = file({
      model: { withoutYou: "yes", repeat: "most", bigCustomer: "little", supplier: "fine", edge: "Taste", channels: ["walk-in"], streams: "few", mustHave: "location", premises: "long" },
      numbers: { ...numbers, records: "bank" },
      docs: [{ id: "1", kind: "bank", name: "statement.pdf", size: 1, addedAt: "" }],
    });
    expect(confidenceOf(thin)).toBeLessThan(confidenceOf(full));
    expect(confidenceOf(full)).toBeGreaterThanOrEqual(80);
    const a = valuate(thin);
    const b = valuate(full);
    if (a.stage !== "full" || b.stage !== "full") throw new Error("expected full");
    expect((b.high - b.low) / b.mid).toBeLessThan((a.high - a.low) / a.mid);
  });

  test("suggests the biggest gain first, and stops suggesting what's done", () => {
    const list = boosts(file({ numbers: null }));
    expect(list[0].key).toBe("numbers");
    expect(boosts(file()).some((x) => x.key === "numbers")).toBe(false);
  });
});

describe("our estimates count as rough", () => {
  test("estimated costs don't raise how sure we are like the owner's own figures", () => {
    const own = confidenceOf(file());
    const est = confidenceOf(file({ numbers: { ...numbers, estimated: ["lastMonthCosts", "fixedCosts"] } }));
    expect(est).toBe(own - 12);
  });

  test("an estimated last year's sales is treated as not given: no income method, no credit", () => {
    const v = valuate(file({ numbers: { ...numbers, estimated: ["lastYearSales"] } }));
    if (v.stage !== "full") throw new Error("expected full");
    expect(v.methods.find((m) => m.key === "income")?.used).toBe(false);
    expect(confidenceOf(file({ numbers: { ...numbers, estimated: ["lastYearSales"] } }))).toBe(confidenceOf(file()) - 8);
  });

  test("suggests checking estimated costs against records", () => {
    const b = boosts(file({ numbers: { ...numbers, estimated: ["lastMonthCosts"] } }));
    expect(b.find((x) => x.key === "costs")?.gain).toBe(6);
    expect(boosts(file()).some((x) => x.key === "costs")).toBe(false);
  });
});
