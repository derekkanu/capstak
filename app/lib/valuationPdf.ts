import { jsPDF } from "jspdf";
import {
  formatCurrency,
  type ValuationInput,
  type ValuationResult,
} from "./valuation";

/** Build and trigger download of a one-click valuation PDF. Client-only. */
export function generatePdf(input: ValuationInput, result: ValuationResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ink: [number, number, number] = [12, 29, 18];
  const green: [number, number, number] = [16, 43, 26];
  const muted: [number, number, number] = [110, 120, 110];

  // Header band
  doc.setFillColor(...green);
  doc.rect(0, 0, pageW, 96, "F");
  doc.setTextColor(200, 224, 67);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Capstak", margin, 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 200);
  doc.text("Business Valuation Report", margin, 66);
  doc.text(new Date().toLocaleDateString(), pageW - margin, 66, { align: "right" });

  y = 132;

  // Business identity
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(input.businessName || "Your Business", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  const sub = [result.industryLabel, input.location].filter(Boolean).join("  ·  ");
  doc.text(sub, margin, y);
  y += 28;

  // Headline valuation box
  doc.setFillColor(245, 246, 238);
  doc.roundedRect(margin, y, contentW, 92, 8, 8, "F");
  doc.setTextColor(...muted);
  doc.setFontSize(9);
  doc.text("ESTIMATED BUSINESS VALUE", margin + 18, y + 26);
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(formatCurrency(result.mid, result.currency), margin + 18, y + 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text(
    `Likely range  ${formatCurrency(result.low, result.currency)} – ${formatCurrency(result.high, result.currency)}`,
    margin + 18,
    y + 78,
  );
  y += 92 + 28;

  // Key metrics row
  const metrics: [string, string][] = [
    ["Annual revenue", formatCurrency(result.annualRevenue, result.currency)],
    ["Annual net profit", formatCurrency(result.annualNetProfit, result.currency)],
    ["Net margin", `${Math.round(result.netMargin * 100)}%`],
    ["Applied multiple", `${result.adjustedMultiple.toFixed(1)}x`],
  ];
  const cardW = (contentW - 18 * 3) / 4;
  metrics.forEach(([label, value], i) => {
    const x = margin + i * (cardW + 18);
    doc.setFillColor(251, 250, 242);
    doc.roundedRect(x, y, cardW, 58, 6, 6, "F");
    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), x + 10, y + 20);
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(value, x + 10, y + 42);
    doc.setFont("helvetica", "normal");
  });
  y += 58 + 30;

  // Multiple breakdown
  y = sectionTitle(doc, "What shaped the multiple", margin, y, ink);
  const rows: [string, string][] = [
    [`${result.industryLabel} base`, `${result.baseMultiple.toFixed(1)}x`],
    ...result.adjustments.map(
      (a) => [a.label, `${a.delta > 0 ? "+" : ""}${a.delta.toFixed(1)}x`] as [string, string],
    ),
    ["Applied multiple", `${result.adjustedMultiple.toFixed(1)}x`],
  ];
  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setTextColor(...muted);
    doc.text(label, margin, y);
    doc.setTextColor(...ink);
    doc.text(value, pageW - margin, y, { align: "right" });
    y += 16;
  });
  y += 16;

  // Provided information
  y = sectionTitle(doc, "Information you provided", margin, y, ink);
  const fields: [string, string | number | null][] = [
    ["Years in operation", input.yearsInOperation],
    ["Team size", input.teamSize],
    ["Growth trend", input.growthTrend],
    ["Liabilities", input.liabilities != null ? formatCurrency(input.liabilities, result.currency) : null],
    ["Customers", input.customerSegments],
    ["Competitors", input.competitors],
    ["Market size", input.marketSize],
    ["Key assets", input.keyAssets],
    ["Major costs", input.costStructure],
    ["Key processes", input.keyProcesses],
    ["Biggest risks", input.risks],
    ["Growth strategy", input.growthStrategy],
    ["Contingency plan", input.contingencyPlans],
  ];
  doc.setFontSize(10);
  for (const [label, value] of fields) {
    if (value == null || value === "") continue;
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(...muted);
    doc.setFontSize(8);
    doc.text(String(label).toUpperCase(), margin, y);
    y += 13;
    doc.setTextColor(...ink);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(value), contentW);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 8;
  }

  // Disclaimer footer
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  const disc = doc.splitTextToSize(
    "This is an automated, estimate-only valuation generated from the information provided. It is not financial advice or a formal appraisal. Accuracy depends on the accuracy of the inputs.",
    contentW,
  );
  if (y > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    y = margin;
  }
  doc.text(disc, margin, doc.internal.pageSize.getHeight() - 40);

  const safeName = (input.businessName || "business")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  doc.save(`${safeName || "business"}-valuation.pdf`);
}

function sectionTitle(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  color: [number, number, number],
): number {
  doc.setTextColor(...color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(text, x, y);
  doc.setFont("helvetica", "normal");
  return y + 22;
}
