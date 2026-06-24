import Anthropic from "@anthropic-ai/sdk";
import {
  INTAKE_STAGES,
  computeValuation,
  type ValuationInput,
} from "../../lib/valuation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const FLAT_QUESTIONS = INTAKE_STAGES.flatMap((s) => s.questions);

const SYSTEM_PROMPT = `You are Capstak's friendly business-valuation assistant, talking to a small-business owner who is NOT a finance professional. Your job is to gently walk them through a guided interview that gathers everything needed to value their business, and to make them feel at ease.

Voice and rules:
- Warm, plain-English, encouraging. Never use jargon without explaining it.
- Ask ONE question at a time. Keep each message short (1–3 sentences).
- If the user seems confused or asks a question, answer it simply, then re-ask the current intake question.
- Remind them, when natural, that the more accurate their numbers, the more accurate the valuation — but never nag.
- Accept rough estimates ("about", "maybe") gladly. Do not demand precision.
- Do not invent facts the user didn't give.

Work through these topics in order, adapting the wording to the conversation:
${INTAKE_STAGES.map((s, i) => `${i + 1}. ${s.title}\n${s.questions.map((q) => `   - ${q}`).join("\n")}`).join("\n")}

When you have gathered enough to value the business — at minimum a business name, industry, and some sense of revenue and profit — call the \`submit_valuation\` tool with your best structured reading of everything discussed. Annualize the monthly revenue/profit figures into \`annualRevenue\` and \`annualNetProfit\` yourself (e.g. a steady ~$10k/month ≈ $120k/year). Use null for anything genuinely unknown. After calling the tool, do not write anything else.`;

const VALUATION_TOOL: Anthropic.Tool = {
  name: "submit_valuation",
  description:
    "Submit the structured business data collected during the interview so a valuation report can be generated. Call this once enough information has been gathered.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      businessName: { type: ["string", "null"] },
      industry: { type: ["string", "null"] },
      location: { type: ["string", "null"] },
      yearsInOperation: { type: ["number", "null"] },
      revenueThreeMonthsAgo: { type: ["number", "null"], description: "Revenue ~3 months ago, in dollars (monthly)." },
      revenueLastMonth: { type: ["number", "null"], description: "Revenue last month, in dollars (monthly)." },
      annualRevenue: { type: ["number", "null"], description: "Annualized revenue estimate in dollars." },
      annualNetProfit: { type: ["number", "null"], description: "Annualized net profit estimate in dollars." },
      costStructure: { type: ["string", "null"] },
      liabilities: { type: ["number", "null"], description: "Outstanding debts/liabilities in dollars." },
      growthTrend: { type: ["string", "null"], enum: ["increasing", "steady", "decreasing", null] },
      growthRatePct: { type: ["number", "null"] },
      competitors: { type: ["string", "null"] },
      marketSize: { type: ["string", "null"] },
      customerSegments: { type: ["string", "null"] },
      teamSize: { type: ["number", "null"] },
      keyAssets: { type: ["string", "null"] },
      keyProcesses: { type: ["string", "null"] },
      risks: { type: ["string", "null"] },
      growthStrategy: { type: ["string", "null"] },
      contingencyPlans: { type: ["string", "null"] },
    },
    required: ["businessName", "industry"],
  },
};

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(mockTurn(messages));
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [VALUATION_TOOL],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
      const input = toolUse.input as ValuationInput;
      return Response.json({
        type: "report",
        input,
        result: computeValuation(input),
      });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return Response.json({ type: "message", text: text || "Could you tell me a bit more?" });
  } catch (err) {
    console.error("demo route error", err);
    // Fall back to the scripted flow so the demo never hard-fails.
    return Response.json(mockTurn(messages));
  }
}

/**
 * Scripted fallback used when no ANTHROPIC_API_KEY is configured (or the API
 * call fails). Walks the flat question list, then returns a representative
 * sample report so the full experience is demoable offline.
 */
function mockTurn(messages: ChatMessage[]) {
  const userTurns = messages.filter((m) => m.role === "user").length;

  // The greeting (first question) is shown client-side, so the Nth user reply
  // should be followed by question index N (0-based into the remaining list).
  const nextIndex = userTurns;
  if (nextIndex < FLAT_QUESTIONS.length) {
    return { type: "message", text: FLAT_QUESTIONS[nextIndex] };
  }

  const sample = sampleInput(messages);
  return { type: "report", input: sample, result: computeValuation(sample) };
}

function firstNumber(text: string): number | null {
  const m = text.replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d+)?)\s*(k|m)?/i);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (m[2]?.toLowerCase() === "k") n *= 1_000;
  if (m[2]?.toLowerCase() === "m") n *= 1_000_000;
  return n;
}

function sampleInput(messages: ChatMessage[]): ValuationInput {
  const answers = messages.filter((m) => m.role === "user").map((m) => m.content);
  const monthly = answers.map(firstNumber).find((n) => n && n > 100) ?? 18_000;
  return {
    businessName: answers[0]?.slice(0, 60) || "Your Business",
    industry: answers[1] || "Services",
    location: answers[2] || null,
    yearsInOperation: 4,
    revenueThreeMonthsAgo: Math.round(monthly * 0.9),
    revenueLastMonth: monthly,
    annualRevenue: Math.round(monthly * 12),
    annualNetProfit: Math.round(monthly * 12 * 0.18),
    costStructure: "Staffing, software, and marketing",
    liabilities: 25_000,
    growthTrend: "increasing",
    growthRatePct: 8,
    competitors: "A few regional players",
    marketSize: null,
    customerSegments: "Small businesses",
    teamSize: 6,
    keyAssets: "Brand, recurring customers, internal tooling",
    keyProcesses: "Service delivery and customer support",
    risks: "Customer concentration",
    growthStrategy: "Expand into adjacent markets",
    contingencyPlans: "Reduce discretionary spend and focus on top accounts",
  };
}
