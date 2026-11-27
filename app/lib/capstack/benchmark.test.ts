import { describe, expect, test } from "bun:test";
import { toBenchmarkRecord } from "./benchmark";
import { SAMPLE_BASICS, SAMPLE_MODEL, SAMPLE_NUMBERS, sampleDocs } from "./sample";
import type { OwnerFile } from "./types";

const file: OwnerFile = {
  name: "Nkechi",
  email: "nkechi@example.com",
  purpose: "sell",
  basics: SAMPLE_BASICS,
  numbers: SAMPLE_NUMBERS,
  model: SAMPLE_MODEL,
  docs: sampleDocs("2026-11-28T00:00:00Z"),
  createdAt: "",
  updatedAt: "",
};

describe("the anonymised benchmark record", () => {
  test("never carries a name, email, business name or the owner's own words", () => {
    const text = JSON.stringify(toBenchmarkRecord(file, "abc", new Date("2026-11-28")));
    expect(text).not.toContain("Nkechi");
    expect(text).not.toContain("@");
    expect(text).not.toContain("Kitchen");
    expect(text).not.toContain("jollof");
  });

  test("keeps ratios and bands, not exact figures", () => {
    const r = toBenchmarkRecord(file, "abc", new Date("2026-11-28"))!;
    expect(r.kept).toBeGreaterThan(0);
    expect(r.kept).toBeLessThan(1);
    expect(r.people).toBe("3-9");
    expect(r.month).toBe("2026-11");
    expect(r.docs.bank).toBe(1);
    expect(JSON.stringify(r)).not.toContain("1650000");
  });

  test("groups cities outside the biggest few", () => {
    expect(toBenchmarkRecord({ ...file, basics: { ...SAMPLE_BASICS, city: "Nsukka" } }, "x")!.city).toBe("other");
    expect(toBenchmarkRecord(file, "x")!.city).toBe("enugu");
  });
});
