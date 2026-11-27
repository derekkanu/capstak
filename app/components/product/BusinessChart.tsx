import { monthly } from "../../lib/capstack/engine";
import { lastSixMonths, naira } from "../../lib/capstack/format";
import type { Numbers } from "../../lib/capstack/types";

/** Six months of sales (solid) against costs (striped), then what's left, what it owns and what it owes. */
export default function BusinessChart({ numbers }: { numbers: Numbers }) {
  const { sales, costs, left } = monthly(numbers);
  const names = lastSixMonths();
  const top = Math.max(...sales, ...costs, 1);
  // a round ceiling for the axis: 1, 2 or 5 × a power of ten
  const p = Math.pow(10, Math.floor(Math.log10(top)));
  const ceiling = [1, 2, 5, 10].map((k) => k * p).find((v) => v >= top) ?? top;
  const pct = (v: number) => `${Math.max(1.5, (v / ceiling) * 100)}%`;
  const avgLeft = left.reduce((a, b) => a + b, 0) / left.length;
  const own = numbers.equipment + numbers.stock + numbers.cash;
  const label = `Sales and costs for ${names[0]} to ${names[5]}: ${sales.map((s, i) => `${names[i]} sales ${naira(s)}, costs ${naira(costs[i])}`).join("; ")}`;

  return (
    <div className="flex flex-col gap-5">
      <div role="img" aria-label={label} className="flex gap-3.5">
        <div aria-hidden className="flex h-[190px] flex-col justify-between text-[11px] text-[#7a857c]">
          <span>{naira(ceiling)}</span>
          <span>{naira(ceiling / 2)}</span>
          <span>0</span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="grid h-[190px] grid-cols-6 items-end border-b border-[#c9ccc0]">
            {sales.map((s, i) => (
              <div key={i} className="flex h-full items-end justify-center gap-1">
                <div className="w-4 rounded-t-[4px] bg-[repeating-linear-gradient(135deg,#c9ccc0_0_4px,transparent_4px_8px)]" style={{ height: pct(costs[i]) }} />
                <div className={`w-4 rounded-t-[4px] ${i === 5 ? "bg-seal" : "bg-ink"}`} style={{ height: pct(s) }} />
              </div>
            ))}
          </div>
          <div aria-hidden className="grid grid-cols-6 text-center text-[12px] text-[#5d6a61]">
            {names.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[12px] text-[#5d6a61]">Left for you, a month</dt>
          <dd className="m-0 text-[18px]">{naira(avgLeft)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[12px] text-[#5d6a61]">What you own</dt>
          <dd className="m-0 text-[18px]">{naira(own)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[12px] text-[#5d6a61]">What you owe</dt>
          <dd className="m-0 text-[18px]">{naira(numbers.owed)}</dd>
        </div>
      </dl>
    </div>
  );
}

/** The legend that sits beside the chart's title */
export function ChartLegend() {
  return (
    <div className="flex gap-3.5 text-[12px] text-[#5d6a61]">
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-ink" />
        Sales
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full border border-[#9aa39b]" />
        Costs
      </span>
    </div>
  );
}
