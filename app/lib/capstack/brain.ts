import Anthropic from "@anthropic-ai/sdk";

/* Sarah's brain: which language model words her replies, chosen by one setting, SARAH_BRAIN.

   - "simulated" (default): no model. Replies come from the rules and templates in chat.ts / insights.ts. Free,
     works anywhere, sends nothing off the server.
   - "local": a model running on this computer through Ollama (OLLAMA_URL, default http://localhost:11434;
     OLLAMA_MODEL, default qwen3:8b). Free and private, but only where Ollama runs: for testing, not the live site.
   - "live": Claude through the Anthropic API (needs ANTHROPIC_API_KEY, billed per use).

   The value is never the model's: it only words what the rules have already worked out (facts passed in). Any
   failure returns null, and the caller falls back to the simulated reply. Server-only. */

export type BrainMode = "simulated" | "local" | "live";

export function brainMode(): BrainMode {
  const m = process.env.SARAH_BRAIN;
  return m === "local" || m === "live" ? m : "simulated";
}

export type Turn = { role: "user" | "assistant"; content: string };

const TIMEOUT_MS = 45_000;

export async function think(system: string, turns: Turn[]): Promise<string | null> {
  const mode = brainMode();
  try {
    if (mode === "local") return await viaOllama(system, turns);
    if (mode === "live") return await viaClaude(system, turns);
  } catch (e) {
    console.error(`[sarah] ${mode} brain failed, using the simulated reply:`, e instanceof Error ? e.message : e);
  }
  return null;
}

async function viaOllama(system: string, turns: Turn[]): Promise<string | null> {
  const url = (process.env.OLLAMA_URL ?? "http://localhost:11434").replace(/\/$/, "");
  const res = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "qwen3:8b",
      stream: false,
      think: false, // Qwen 3 thinks out loud by default; Sarah should just answer
      options: { temperature: 0.4 },
      messages: [{ role: "system", content: system }, ...turns],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  return clean(data.message?.content);
}

async function viaClaude(system: string, turns: Turn[]): Promise<string | null> {
  const client = new Anthropic({ timeout: TIMEOUT_MS }); // reads ANTHROPIC_API_KEY
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    output_config: { effort: "low" }, // short conversational replies don't need deep thinking
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: [{ model: "claude-opus-4-8" }], // if a reply is declined, Anthropic retries it on this model
    system,
    messages: turns,
  });
  if (response.stop_reason === "refusal") return null;
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  return clean(text);
}

/** drop any reasoning a local model leaks, and trim */
function clean(text: string | undefined | null): string | null {
  const t = (text ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return t.length ? t : null;
}

/** who Sarah is, for every model */
export const SARAH_SYSTEM = `You are Sarah, the guide inside Capstack, which helps small business owners in Nigeria find out what their business is worth.

How you speak: plain, warm, brief English, like a sharp, kind older cousin who works in finance. Say "what it's worth", "sales", "what's left for you", "what you owe" - never jargon like valuation, EBITDA, revenue or liabilities. Two or three short sentences unless asked for more. No lists unless asked. Never make the owner feel small.

Rules:
- The value, the range and how sure we are come from Capstack's fixed rules and are given to you below as facts. Never invent, change or recalculate a figure. If you don't have a fact, say you don't know yet and what would tell us.
- Only talk about this owner's business, Capstack and running a small business. Politely decline anything else.
- Never give investment, legal or tax advice; for a formal valuation, a registered valuer.
- Some answers may be marked as our estimates, not the owner's figures; treat them as rough.`;
