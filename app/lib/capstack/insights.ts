import { confidenceLabel, monthly, sectorOf, valuate } from "./engine";
import { naira, nairaRange } from "./format";
import { MODEL } from "./questions";
import { audience } from "./sarah";
import { TRADE } from "./suggest";
import type { OwnerFile } from "./types";

/* What Sarah notices about a business: the content of "Sarah's report" and of her notifications. Each insight is
   worked out from the owner's answers and the benchmarks for their trade, so it works with no AI at all; a language
   model (when switched on) only words the summary and the chat around them. Ids are stable for the same finding,
   so a notification is "new" only when something new is found. */

export type Insight = {
  id: string;
  kind: "strength" | "risk" | "tip";
  title: string;
  body: string;
};

type F = Pick<OwnerFile, "purpose" | "basics" | "numbers" | "model" | "docs">;

const pts = (x: number) => Math.round(x * 100);

export function insightsFor(f: F): Insight[] {
  if (!f.basics || !f.numbers) return [];
  const out: Insight[] = [];
  const t = TRADE[f.basics.sector];
  const trade = sectorOf(f.basics.sector).label.toLowerCase();
  const who = audience(f.purpose);
  const { sales, left } = monthly(f.numbers);
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const avgSales = avg(sales);
  const kept = avgSales > 0 ? avg(left) / avgSales : 0;

  // what's left, against the trade
  if (kept - t.kept >= 0.03)
    out.push({
      id: "margin-high",
      kind: "strength",
      title: "You keep more than most in your trade",
      body: `You keep about ₦${pts(kept)} of every ₦100 that comes in; ${trade} businesses usually keep about ₦${pts(t.kept)}. That's the strongest thing in your file for ${who}.`,
    });
  else if (t.kept - kept >= 0.03)
    out.push({
      id: "margin-low",
      kind: "risk",
      title: "You keep less than most in your trade",
      body: `You keep about ₦${pts(kept)} of every ₦100; ${trade} businesses usually keep about ₦${pts(t.kept)}. Finding where the gap goes (prices, waste, a cost that's crept up) would lift your value directly.`,
    });

  // fixed costs: a slow month hurts more
  const fixedShare = f.numbers.lastMonthCosts > 0 ? Math.min(f.numbers.fixedCosts, f.numbers.lastMonthCosts) / f.numbers.lastMonthCosts : 0;
  if (fixedShare - t.fixed >= 0.15 && !f.numbers.estimated?.includes("fixedCosts"))
    out.push({
      id: "fixed-high",
      kind: "risk",
      title: "Your fixed costs are high for your trade",
      body: `About ${pts(fixedShare)}% of your costs stay the same every month, against about ${pts(t.fixed)}% for ${trade} businesses. A slow month hits you harder, and ${who} will notice.`,
    });

  // sales that swing
  const swing = avgSales > 0 ? (Math.max(...sales) - Math.min(...sales)) / avgSales : 0;
  if (swing >= 0.3)
    out.push({
      id: "swing",
      kind: "tip",
      title: "Your sales swing from month to month",
      body: `Your best and slowest months are ${naira(Math.max(...sales) - Math.min(...sales))} apart. If there's a reason (school terms, festive season), say so in your file: explained swings worry buyers far less.`,
    });

  // debts against earnings
  const yearlyLeft = avg(left) * 12;
  if (f.numbers.owed > 0 && yearlyLeft > 0 && f.numbers.owed > yearlyLeft)
    out.push({
      id: "debt",
      kind: "risk",
      title: "Your debts are more than a year of what's left",
      body: `You owe ${naira(f.numbers.owed)}, more than the ${naira(yearlyLeft)} left for you in a year. It doesn't change what the business is worth, but it comes off what you'd keep.`,
    });

  // the business-model answers
  if (f.model.withoutYou === "no" || f.model.withoutYou === "partly")
    out.push({
      id: "owner",
      kind: "tip",
      title: "Make it run without you",
      body: "Write down how the day runs (suppliers, prices, who does what) and let someone else run a week. A business that doesn't need its owner is worth noticeably more.",
    });
  if (f.model.bigCustomer === "half")
    out.push({
      id: "concentration",
      kind: "risk",
      title: "One customer is half your sales",
      body: `If they leave, half the business goes with them, and ${who} will price that in. A written agreement with them, or a few new regulars, would ease it.`,
    });
  if (f.model.repeat === "most")
    out.push({
      id: "repeat",
      kind: "strength",
      title: "Your customers come back",
      body: "Repeat customers are the sales a buyer can count on. If you can show it (a list of regulars, standing orders), show it.",
    });

  // reading the owner's own words (keywords now; a language model reads it properly once switched on)
  const edge = (f.model.edge ?? "").toLowerCase();
  if (edge) {
    if (/on time|deliver|reliab|fast|quick/.test(edge))
      out.push({ id: "edge-reliable", kind: "strength", title: "Reliability is your edge", body: `You said: "${f.model.edge}". Reliability is hard for a competitor to copy, and it stays with the business when you sell, if it's built into how you work.` });
    if (/cheap|price|afford|low cost/.test(edge))
      out.push({ id: "edge-price", kind: "risk", title: "Winning on price is hard to sell", body: `You said: "${f.model.edge}". Customers who come for price leave for a lower one. Buyers pay more for a reason customers would stay.` });
    if (/taste|quality|best|recipe|skill/.test(edge))
      out.push({ id: "edge-quality", kind: "tip", title: "Make sure your quality isn't just you", body: `You said: "${f.model.edge}". If the quality depends on your own hands, a buyer worries it leaves with you. Written recipes, methods or a trained team make it part of the business.` });
  }

  // documents
  if (!f.docs.some((d) => d.kind === "bank"))
    out.push({
      id: "no-bank",
      kind: "tip",
      title: "Bank statements would back you up",
      body: `Everything above is from your answers. Six months of bank statements turn them into proof, and they're the first thing ${who} asks for.`,
    });

  return out;
}

/** a plain-words digest of the file for a language model: facts only, worked out by the rules */
export function factsFor(f: F): string {
  if (!f.basics) return "The owner hasn't told us about their business yet.";
  const v = valuate(f);
  const lines = [
    `Business: ${f.basics.businessName}, ${sectorOf(f.basics.sector).label} in ${f.basics.city}, ${f.basics.people} people, open ${f.basics.years.replace("lt1", "under 1").replace("10+", "over 10")} years.`,
    `Why they came: ${audience(f.purpose)} is who they'll show the value to.`,
  ];
  if (v.stage !== "none") lines.push(`Value (fixed rules, never change it): ${nairaRange(v.low, v.high)}, how sure: ${confidenceLabel(v.confidence).toLowerCase()} (${v.confidence}%).`);
  if (v.stage === "full") {
    lines.push(`Multiple: ${v.multiple.toFixed(1)} years of what's left for the owner. After debts they'd keep about ${naira(v.afterDebts)}.`);
    lines.push(`What moved it: ${v.reasons.map((r) => `${r.label} (${r.delta > 0 ? "+" : ""}${r.delta})`).join("; ") || "nothing"}.`);
  }
  if (f.numbers) {
    const { sales, costs } = monthly(f.numbers);
    lines.push(`Last six months' sales: ${sales.map(naira).join(", ")}. Costs: ${costs.map(naira).join(", ")}.`);
    lines.push(`Owns: equipment ${naira(f.numbers.equipment)}, stock ${naira(f.numbers.stock)}, cash ${naira(f.numbers.cash)}. Owes: ${naira(f.numbers.owed)}.`);
    if (f.numbers.estimated?.length) lines.push(`These answers are our estimates, not the owner's figures: ${f.numbers.estimated.join(", ")}.`);
  }
  const answers = MODEL.filter((q) => f.model[q.id as keyof typeof f.model] !== undefined).map((q) => `${q.prompt} ${JSON.stringify(f.model[q.id as keyof typeof f.model])}`);
  if (answers.length) lines.push(`How they make money: ${answers.join(" | ")}`);
  lines.push(`Documents: ${f.docs.length ? f.docs.map((d) => d.kind).join(", ") : "none yet"}.`);
  return lines.join("\n");
}

/** the short paragraph at the top of Sarah's report, when no language model is on */
export function simulatedSummary(f: F, list: Insight[]): string {
  if (!list.length) return "Once your sales and costs are in, I'll tell you what stands out about your business.";
  const strengths = list.filter((i) => i.kind === "strength").map((i) => i.title.toLowerCase());
  const risks = list.filter((i) => i.kind === "risk").map((i) => i.title.toLowerCase());
  const parts = [];
  if (strengths.length) parts.push(`What's working: ${strengths.join("; ")}.`);
  if (risks.length) parts.push(`What ${audience(f.purpose)} will question: ${risks.join("; ")}.`);
  if (!parts.length) parts.push(list[0].body);
  return parts.join(" ");
}
