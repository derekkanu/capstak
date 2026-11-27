"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { insightsFor } from "../../lib/capstack/insights";
import { updateFile } from "../../lib/capstack/store";
import type { OwnerFile } from "../../lib/capstack/types";
import { SarahAvatar } from "./Bits";

/** The notification bar: when Sarah has found something new about the business, a slim bar says so on every page,
 *  until the owner opens Sarah's report or dismisses it. */
export default function SarahNotice({ file }: { file: OwnerFile }) {
  const path = usePathname();
  const seen = new Set(file.seenInsights ?? []);
  const fresh = insightsFor(file).filter((i) => !seen.has(i.id));
  if (!fresh.length || path.startsWith("/app/report")) return null;

  const dismiss = () => updateFile((f) => ({ ...f, seenInsights: Array.from(new Set([...(f.seenInsights ?? []), ...fresh.map((i) => i.id)])) }));
  return (
    <div role="status" className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] bg-ink px-4 py-2.5 text-cream print:hidden">
      <SarahAvatar size={28} />
      <span className="flex-1 text-[14px]">
        Sarah found {fresh.length === 1 ? "something new" : `${fresh.length} new things`} about your business:{" "}
        <span className="text-cream/70">{fresh[0].title.toLowerCase()}</span>
        {fresh.length > 1 ? <span className="text-cream/70"> and more</span> : null}.
      </span>
      <Link href="/app/report#sarah" className="inline-flex min-h-9 items-center rounded-full bg-lime px-4 text-[13px] font-medium text-green no-underline">
        See them
      </Link>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="flex h-9 w-9 items-center justify-center rounded-full text-cream/70 hover:bg-white/10">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
