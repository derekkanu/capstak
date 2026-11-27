/** ₦4.8M, ₦350k, ₦900: short Naira for ranges and labels */
export function naira(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e9) return `${sign}₦${trim(a / 1e9)}B`;
  if (a >= 1e6) return `${sign}₦${trim(a / 1e6)}M`;
  if (a >= 1e3) return `${sign}₦${Math.round(a / 1e3)}k`;
  return `${sign}₦${Math.round(a)}`;
}

const trim = (v: number) => (v >= 100 ? Math.round(v).toString() : v.toFixed(1).replace(/\.0$/, ""));

/** ₦4.8M–8.1M */
export const nairaRange = (low: number, high: number) => `${naira(low)}–${naira(high).replace("₦", "")}`;

/** 1,250,000 for inputs */
export const grouped = (n: number) => new Intl.NumberFormat("en-NG").format(n);

/** the last six month names, oldest first, ending last month */
export function lastSixMonths(now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
    return d.toLocaleString("en-GB", { month: "short" });
  });
}
