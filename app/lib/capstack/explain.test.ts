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

  test("with numbers, the value is put in the owner's terms, and says what's left to do", () => {
    const mid = explainValue({ ...base, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS });
    expect(mid).toMatch(/years of what's left for you/);
    expect(mid).toContain("How you make money");
    const done = explainValue({ ...base, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS, model: SAMPLE_MODEL, docs: sampleDocs() });
    expect(done).toContain("you'd keep about");
  });

  test("the chart line reads as a sentence and speaks to the owner's audience", () => {
    const s = explainNumbers({ ...base, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS })!;
    expect(s).toMatch(/of every ₦100 that comes in/);
    expect(s).toContain("a buyer");
    expect(s).not.toMatch(/You keep/); // when a trend leads, it continues the sentence
  });
});
