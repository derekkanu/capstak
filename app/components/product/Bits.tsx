import Link from "next/link";

/* Small pieces shared by the product screens. */

export function Wordmark({ href = "/app" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 text-ink no-underline" aria-label="Capstack home">
      <span className="text-[22px] font-semibold tracking-[-0.03em]">Capstack</span>
      <Arrowhead className="h-[11px] w-[11px] text-seal" />
    </Link>
  );
}

export function Arrowhead({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M0 0H100V32H54L94 72L72 94L32 54V100H0Z" fill="currentColor" />
    </svg>
  );
}

/** Sarah, the guide: a lime disc with her initial (a portrait comes with the brand photography) */
export function SarahAvatar({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-lime font-semibold text-green"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      S
    </span>
  );
}

export function Pill({ children, tone = "board" }: { children: React.ReactNode; tone?: "board" | "lime" | "ink" }) {
  const tones = { board: "bg-[#ecebe2] text-ink", lime: "bg-lime text-green", ink: "bg-ink text-cream" };
  return <span className={`inline-flex min-h-9 items-center rounded-full px-4 text-[13px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function Tick({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Lock({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
