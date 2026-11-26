/* The paper trail: receipts, statements, alerts and notes drifting in a slow line across the hero and
   passing through the file (they slide behind it and come out the other side). Pure CSS marquee: the set
   is drawn twice and the track moves by half its width, so it loops without a seam. Holds still for
   reduced motion. All figures are illustrations. */

type Paper = { kind: "pos" | "a4" | "alert" | "note" | "ledger" | "invoice" | "polaroid" | "form"; tilt: number; lift: number };

const SET: Paper[] = [
  { kind: "pos", tilt: -6, lift: -10 },
  { kind: "a4", tilt: 4, lift: 14 },
  { kind: "alert", tilt: -2, lift: -24 },
  { kind: "note", tilt: 7, lift: 18 },
  { kind: "ledger", tilt: -4, lift: -4 },
  { kind: "invoice", tilt: 3, lift: 20 },
  { kind: "polaroid", tilt: -7, lift: -6 },
  { kind: "pos", tilt: 5, lift: -18 },
  { kind: "form", tilt: 4, lift: 16 },
  { kind: "alert", tilt: -5, lift: 10 },
];

function PaperCard({ p, i }: { p: Paper; i: number }) {
  const style = { transform: `translateY(${p.lift}px) rotate(${p.tilt}deg)` };
  const shadow = "shadow-[0_14px_28px_-18px_rgba(4,46,27,0.55)]";
  switch (p.kind) {
    case "pos":
      return (
        <div style={style} className={`receipt w-[118px] shrink-0 px-3 pb-4 pt-2.5 font-mono text-[9.5px] leading-[1.7] text-ink ${shadow}`}>
          <div className="mb-1 border-b border-dashed border-ink/25 pb-1 text-center font-semibold tracking-[0.12em]">POS · {i % 2 ? "JUN" : "MAY"}</div>
          <div className="flex justify-between"><span>SALES</span><span>{i % 2 ? "₦4.1M" : "₦3.5M"}</span></div>
          <div className="flex justify-between"><span>COSTS</span><span>{i % 2 ? "₦2.9M" : "₦2.6M"}</span></div>
          <div className="flex justify-between"><span>LEFT</span><span>{i % 2 ? "₦1.2M" : "₦890k"}</span></div>
        </div>
      );
    case "a4":
      return (
        <div style={style} className={`grid aspect-[1/1.3] w-[128px] shrink-0 content-start gap-1.5 rounded-[2px] bg-white p-3 ${shadow}`}>
          <span className="font-mono text-[7.5px] font-medium tracking-[0.1em] text-ink/50">BANK STATEMENT · APR</span>
          {Array.from({ length: 7 }, (_, k) => (
            <span key={k} className="flex justify-between gap-2">
              <span className="h-[4px] flex-1 rounded bg-[#ecebe5]" />
              <span className="h-[4px] w-[22%] rounded bg-[#dfe6dc]" />
            </span>
          ))}
          <span className="mt-1 font-mono text-[9px] font-medium text-green">₦12.4M in</span>
        </div>
      );
    case "alert":
      return (
        <div style={style} className={`w-[176px] shrink-0 rounded-[12px] bg-white/95 p-3 ${shadow}`}>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-green font-mono text-[9px] text-lime">₦</span>
            <span className="text-[11px] font-semibold text-ink">Credit alert</span>
            <span className="ml-auto text-[10px] text-ink/40">now</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-ink/70">
            {i % 2 ? "₦280,000 from Grace Tailoring" : "₦450,000 from Lekki Hotels Ltd"}
          </p>
        </div>
      );
    case "note":
      return (
        <div style={style} className={`w-[112px] shrink-0 bg-[#f4e98a] p-3 text-[12px] leading-snug text-ink/80 ${shadow}`}>
          Rent due Friday. Ask Musa about the new supplier.
        </div>
      );
    case "ledger":
      return (
        <div
          style={style}
          className={`relative w-[140px] shrink-0 rounded-[2px] bg-[#fbf5ea] py-2 pl-6 pr-2 font-mono text-[9px] leading-[18px] text-[#34406b] ${shadow}`}
        >
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(transparent_17px,#c9d9e8_18px)] bg-[length:100%_18px]" />
          <span aria-hidden className="absolute bottom-0 left-4 top-0 w-px bg-[#e7a9a3]" />
          <span className="relative block">Mon · 14 chairs</span>
          <span className="relative block">Tue · 2 tables</span>
          <span className="relative block">Wed · 1 bed frame</span>
          <span className="relative block">Thu · repairs</span>
        </div>
      );
    case "polaroid":
      return (
        <div style={style} className={`w-[112px] shrink-0 bg-white p-1.5 pb-5 ${shadow}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/owners/caterer.jpg" alt="" className="aspect-square w-full object-cover" />
          <span className="mt-1 block font-mono text-[8px] text-ink/55">The kitchen · Lagos</span>
        </div>
      );
    case "form":
      return (
        <div style={style} className={`w-[150px] shrink-0 rounded-[2px] bg-[#f6efe2] p-2.5 font-mono text-[8px] text-ink ${shadow}`}>
          {[
            ["BUSINESS", "BLOOM & PETAL"],
            ["TRADE", "FLORIST"],
            ["CITY", "ABUJA"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[52px_1fr] border border-b-0 border-ink/40 last:border-b">
              <span className="border-r border-ink/40 px-1 py-1 text-[6.5px] text-ink/55">{k}</span>
              <span className="px-1 py-1 font-medium">{v}</span>
            </div>
          ))}
        </div>
      );
    case "invoice":
      return (
        <div style={style} className={`w-[132px] shrink-0 rounded-[2px] bg-white p-3 ${shadow}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-green">Invoice</span>
            <span className="font-mono text-[8px] text-ink/45">#0087</span>
          </div>
          <span className="mt-2 block h-[4px] w-[80%] rounded bg-[#ecebe5]" />
          <span className="mt-1 block h-[4px] w-[60%] rounded bg-[#ecebe5]" />
          <div className="mt-2 flex justify-between border-t border-ink/10 pt-1.5 font-mono text-[9px] text-ink">
            <span>TOTAL</span>
            <span>₦640k</span>
          </div>
        </div>
      );
  }
}

export default function PaperStream() {
  const row = [...SET, ...SET];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 w-screen -translate-x-1/2 -translate-y-[12%] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
    >
      <div className="paper-stream flex w-max items-center gap-14 py-10">
        {row.map((p, i) => (
          <PaperCard key={i} p={p} i={i} />
        ))}
      </div>
    </div>
  );
}
