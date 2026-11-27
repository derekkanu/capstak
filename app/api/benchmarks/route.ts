import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { BenchmarkRecord } from "../../lib/capstack/benchmark";

/* Receives anonymised benchmark records (only sent when the owner has agreed). Until there's a database, records
   are kept in a git-ignored file when running locally (.data/benchmarks.jsonl, one record per line; a later line
   with the same id replaces an earlier one). On the live site nothing is stored yet: the route says so. */

const FILE = path.join(process.cwd(), ".data", "benchmarks.jsonl");

export async function POST(req: Request) {
  let record: BenchmarkRecord;
  try {
    record = (await req.json()) as BenchmarkRecord;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  // only the anonymised shape is accepted: anything carrying a name or email is refused outright
  const text = JSON.stringify(record);
  if (record?.v !== 1 || /@|"name"|"email"|"businessName"|"edge"/.test(text)) return NextResponse.json({ error: "Not an anonymised record" }, { status: 400 });

  if (process.env.VERCEL) return NextResponse.json({ stored: false, reason: "No database yet on the live site" }, { status: 202 });
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await appendFile(FILE, text + "\n", "utf8");
    return NextResponse.json({ stored: true });
  } catch {
    return NextResponse.json({ stored: false }, { status: 202 });
  }
}
