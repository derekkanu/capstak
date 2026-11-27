import { describe, expect, test } from "bun:test";
import { explainNumbers, explainValue } from "./explain";
import { SAMPLE_BASICS, SAMPLE_MODEL, SAMPLE_NUMBERS, sampleDocs } from "./sample";

const base = { purpose: "sell" as const, basics: null, numbers: null, model: {}, docs: [] };

describe("what the numbers mean, stage by stage", () => {
  test("nothing to explain before the basics", () => {
    expect(explainValue(base)).toBeNull();
    expect(explainNumbers(base)).toBeNull();
  });

  test("a first look says why it's wide", () => {
    expect(explainValue({ ...base, basics: SAMPLE_BASICS })).toContain("wide");
  });

  test("with numbers, the value is put in the owner's terms, in one sentence", () => {
    const mid = explainValue({ ...base, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS })!;
    expect(mid).toMatch(/years of what's left for you/);
    // one sentence per block on the desk
    expect(mid.split(". ").length).toBe(1);
    const done = explainValue({ ...base, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS, model: SAMPLE_MODEL, docs: sampleDocs() })!;
    expect(done.split(". ").length).toBe(1);
  });

  test("the chart line is one sentence", () => {
    const s = explainNumbers({ ...base, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS })!;
    expect(s).toMatch(/of every ₦100 that comes in\.$/);
    expect(s).not.toMatch(/You keep/); // when a trend leads, it continues the sentence
  });
});
