import { monthly, sectorOf, valuate } from "./engine";
import { naira } from "./format";
import type { OwnerFile } from "./types";

/* One short sentence under the value and one under the chart, saying what the numbers mean at the owner's stage.
   One sentence per block on the desk: what to do next is Sarah's job and the file list's, not these lines'. */

type F = Pick<OwnerFile, "purpose" | "basics" | "numbers" | "model" | "docs">;

export function explainValue(f: F): string | null {
  const v = valuate(f);
  if (v.stage === "none" || !f.basics) return null;
  const trade = sectorOf(f.basics.sector).label.toLowerCase();

  if (v.stage === "first-look") return "A wide first look, from your trade and rough sales, not yet from what's left for you.";
  return `About ${v.multiple.toFixed(1)} years of what's left for you (${naira(v.yearlyLeft / 12)} a month), what buyers of ${trade} businesses typically pay.`;
}

export function explainNumbers(f: F): string | null {
  if (!f.numbers) return null;
  const { sales, left } = monthly(f.numbers);
  const avgLeft = left.reduce((a, b) => a + b, 0) / left.length;
  const v = valuate(f);
  const trend =
    v.stage === "full"
      ? v.trend === "growing"
        ? "Sales are growing faster than prices"
        : v.trend === "shrinking"
          ? "Sales have been falling"
          : "Sales are holding steady"
      : "";
  const margin = sales.reduce((a, b) => a + b, 0) > 0 ? avgLeft / (sales.reduce((a, b) => a + b, 0) / sales.length) : 0;
  const keep = `you keep about ₦${Math.round(margin * 100)} of every ₦100 that comes in`;
  return `${trend}${trend ? ", and " : "You "}${trend ? keep : keep.replace(/^you /, "")}.`;
}
