import { describe, expect, test } from "bun:test";
import { SAMPLE_BASICS } from "./sample";
import { suggestFor } from "./suggest";

const months = [1_300_000, 1_400_000, 1_500_000, 1_400_000, 1_600_000, 1_500_000];

describe("estimates from what the owner already told us", () => {
  test("costs last month: sales minus what the trade usually keeps", () => {
    const s = suggestFor("lastMonthCosts", { basics: SAMPLE_BASICS, answers: { months } });
    expect(s?.value).toBe(1_300_000); // food keeps ~15% of ₦1.5M
    expect(s?.why).toContain("Food businesses");
  });

  test("fixed costs: the trade's usual fixed share of last month's costs", () => {
    expect(suggestFor("fixedCosts", { basics: SAMPLE_BASICS, answers: { months, lastMonthCosts: 1_200_000 } })?.value).toBe(540_000);
  });

  test("last year's sales: six months times two", () => {
    expect(suggestFor("lastYearSales", { basics: SAMPLE_BASICS, answers: { months } })?.value).toBe(17_000_000);
  });

  test("stock: none suggested for trades that don't hold stock", () => {
    expect(suggestFor("stock", { basics: { ...SAMPLE_BASICS, sector: "services" }, answers: { lastMonthCosts: 1e6 } })).toBeNull();
    expect(suggestFor("stock", { basics: SAMPLE_BASICS, answers: { lastMonthCosts: 1_200_000, fixedCosts: 400_000 } })?.value).toBe(200_000);
  });

  test("nothing to offer without the answers it builds on, or for what only the owner knows", () => {
    expect(suggestFor("fixedCosts", { basics: SAMPLE_BASICS, answers: {} })).toBeNull();
    expect(suggestFor("lastMonthCosts", { basics: null, answers: { months } })).toBeNull();
    expect(suggestFor("equipment", { basics: SAMPLE_BASICS, answers: { months } })).toBeNull();
  });
});

describe("questions worded for the business", () => {
  test("a service business is asked about supplies, not shelves, and can answer none", async () => {
    const { NUMBERS, forBusiness } = await import("./questions");
    const stock = NUMBERS.find((q) => q.id === "stock")!;
    const services = forBusiness(stock, { sector: "services" });
    expect(services.prompt).toContain("supplies");
    expect(services.prompt).not.toContain("shelves");
    expect(services.none).toBeTruthy();
    expect(forBusiness(stock, { sector: "trade" }).prompt).toContain("shelves");
    expect(forBusiness(stock, null).prompt).toBe(stock.prompt);
  });
});
