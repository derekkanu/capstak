import { describe, expect, test } from "bun:test";
import { greeting, sarahReply } from "./chat";
import { SAMPLE_BASICS, SAMPLE_MODEL, SAMPLE_NUMBERS, sampleDocs } from "./sample";
import { chapters, nextStep } from "./sarah";

const empty = { name: "Nkechi", purpose: "sell" as const, basics: null, numbers: null, model: {}, docs: [] };
const full = { ...empty, basics: SAMPLE_BASICS, numbers: SAMPLE_NUMBERS, model: SAMPLE_MODEL, docs: sampleDocs("2026-11-27T00:00:00Z") };

describe("Sarah's chat", () => {
  test("opens with the next step", () => {
    const g = greeting(empty);
    expect(g.text).toContain("Hi Nkechi");
    expect(g.action?.href).toBe("/app/file/basics");
  });

  test("answers 'what is it worth' from the file", () => {
    expect(sarahReply("What is my business worth?", empty).action?.href).toBe("/app/file/basics");
    const r = sarahReply("what's it worth", full);
    expect(r.text).toContain("Mama Nkechi's Kitchen");
    expect(r.text).toMatch(/₦[\d.]+M–/);
  });

  test("says what's holding the value back", () => {
    const r = sarahReply("How can I raise my value?", { ...full, model: { ...SAMPLE_MODEL, withoutYou: "no" } });
    expect(r.text.toLowerCase()).toContain("depends on you");
  });

  test("owns up to what it can't answer", () => {
    expect(sarahReply("what's the weather in Lagos", full).text).toContain("can't answer that one yet");
  });
});

describe("keeping the file current", () => {
  test("done chapters carry when they were last updated", () => {
    const c = chapters({ ...full, chapterUpdatedAt: { numbers: "2026-11-01T00:00:00Z" } });
    expect(c.find((x) => x.key === "numbers")?.updatedAt).toBe("2026-11-01T00:00:00Z");
  });

  test("numbers older than a month get a nudge before anything else", () => {
    const s = nextStep({ ...full, chapterUpdatedAt: { numbers: "2026-09-01T00:00:00Z" } }, new Date("2026-11-27T00:00:00Z"));
    expect(s.key).toBe("refresh");
    expect(nextStep({ ...full, chapterUpdatedAt: { numbers: "2026-11-20T00:00:00Z" } }, new Date("2026-11-27T00:00:00Z")).key).toBe("report");
  });
});
