import { modelAnswered, monthly, sectorOf, valuate } from "./engine";
import { naira } from "./format";
import { audience } from "./sarah";
import { MODEL_KEYS, type OwnerFile } from "./types";

/* One or two plain sentences under the value and under the chart, saying what the numbers mean at the owner's
   stage: why a first look is wide, what the value is made of once the numbers are in, and what's moving it. */

type F = Pick<OwnerFile, "purpose" | "basics" | "numbers" | "model" | "docs">;

export function explainValue(f: F): string | null {
  const v = valuate(f);
  if (v.stage === "none" || !f.basics) return null;
  const trade = sectorOf(f.basics.sector).label.toLowerCase();

  if (v.stage === "first-look")
    return `A first look from your trade and rough monthly sales. It's wide because we don't know what's left for you each month yet.`;

  const years = v.multiple.toFixed(1);
  const left = naira(v.yearlyLeft / 12);
  let s = `About ${years} years of what's left for you (${left} a month), which is what buyers of ${trade} businesses typically pay.`;

  const answered = modelAnswered(f.model);
  if (answered < MODEL_KEYS.length) s += ` How you make money can still move it up or down.`;
  else if (!f.docs.some((d) => d.kind === "bank")) s += ` Bank statements would narrow the range.`;
  else s += ` After paying what it owes, you'd keep about ${naira(v.afterDebts)}.`;
  return s;
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
  return `${trend}${trend ? ", and " : "You "}${trend ? keep : keep.replace(/^you /, "")}. What's left each month is what ${audience(f.purpose)} pays for, so it moves your value most.`;
}
