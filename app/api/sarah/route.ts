import { NextResponse } from "next/server";
import { brainMode, SARAH_SYSTEM, think, type Turn } from "../../lib/capstack/brain";
import { sarahReply } from "../../lib/capstack/chat";
import { factsFor, insightsFor, simulatedSummary } from "../../lib/capstack/insights";
import type { OwnerFile } from "../../lib/capstack/types";

/* Sarah's two jobs on the server:
   - chat: answer the owner. The rules always choose the action button; the brain (when on) words the reply.
   - insights: Sarah's report. The rules find the insights; the brain (when on) writes the summary.
   Until accounts exist the owner's file comes in the request (it lives in their browser). */

type Body =
  | { task: "chat"; file: OwnerFile; message: string; history?: Turn[] }
  | { task: "insights"; file: OwnerFile };

export async function GET() {
  return NextResponse.json({ brain: brainMode() });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const mode = brainMode();

  if (body.task === "chat") {
    const message = String(body.message ?? "").slice(0, 1000);
    const ruled = sarahReply(message, body.file);
    if (mode === "simulated") return NextResponse.json({ ...ruled, source: "simulated" });
    const history = (body.history ?? []).slice(-8);
    // the rules' own answer is handed over as the ground truth to rephrase, which keeps a small model accurate and short
    const text = await think(
      `${SARAH_SYSTEM}\n\nFacts about this owner's file:\n${factsFor(body.file)}\n\nCapstack's own answer to this question, which is correct: "${ruled.text}"\nReply in at most three short sentences. Keep to that answer's facts; you may make it warmer and more specific to this owner, but don't add claims it doesn't support.`,
      [...history, { role: "user", content: message }],
    );
    return NextResponse.json(text ? { text, action: ruled.action, source: mode } : { ...ruled, source: "simulated" });
  }

  if (body.task === "insights") {
    const insights = insightsFor(body.file);
    const fallback = simulatedSummary(body.file, insights);
    if (mode === "simulated" || !insights.length) return NextResponse.json({ summary: fallback, insights, source: "simulated" });
    const summary = await think(
      `${SARAH_SYSTEM}\n\nFacts about this owner's file:\n${factsFor(body.file)}`,
      [
        {
          role: "user",
          content: `Write the opening paragraph of "Sarah's report" for this owner: three short sentences on what stands out about their business and what to do first. Use these findings, don't add new figures:\n${insights.map((i) => `- ${i.title}: ${i.body}`).join("\n")}`,
        },
      ],
    );
    return NextResponse.json({ summary: summary ?? fallback, insights, source: summary ? mode : "simulated" });
  }

  return NextResponse.json({ error: "Unknown task" }, { status: 400 });
}
