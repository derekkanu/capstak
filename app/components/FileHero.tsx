"use client";

import { useEffect, useState } from "react";
import { Folder, Seal, TILT } from "./FilePieces";
import Conveyor from "./Conveyor";
import { quickEstimate, type QuickInput } from "../lib/quickEstimate";

/* The hero's living file: back folders, the owner's photo clipped in as the first page, and the dark
   green lid with the value. In the hero (intro) bundles of paperwork flow into it (Conveyor) and the lid
   opens a touch and closes behind each one. Outside the hero it plays the older loop (receipt in, report
   up, stamp). The figures are an illustration; the same business appears across the page. */

// the owners pinned in as the first page, one per bundle filed. Each is a different (illustrative) business,
// valued with the same method as the free calculator, so the cover's name and range change with the photo.
const OWNERS = [
  {
    // the workshop photo the hero was built around; it already has the green cast, so no grade on top
    src: "/maker.jpg", pos: "50% 12%", name: "Okafor Woodworks", file: "0142", grade: false,
    q: { sector: "making", monthlySales: 3_500_000, monthlyLeft: 890_000, tenure: "established", trend: "growing", withoutYou: "partly", records: "bank" },
  },
  {
    src: "/owners/consultant.jpg", pos: "55% 62%", name: "Adaeze Consulting", file: "0143", grade: true,
    q: { sector: "services", monthlySales: 6_000_000, monthlyLeft: 1_800_000, tenure: "mid", trend: "growing", withoutYou: "partly", records: "bank" },
  },
  {
    src: "/owners/landscaper.jpg", grade: true, pos: "45% 6%", name: "Greenline Gardens", file: "0144",
    q: { sector: "services", monthlySales: 2_500_000, monthlyLeft: 600_000, tenure: "mid", trend: "growing", withoutYou: "no", records: "some" },
  },
  {
    src: "/owners/designer.jpg", grade: true, pos: "35% 50%", name: "Pixelhaus Studio", file: "0145",
    q: { sector: "tech", monthlySales: 5_000_000, monthlyLeft: 1_750_000, tenure: "mid", trend: "growing", withoutYou: "partly", records: "bank" },
  },
  {
    src: "/owners/events.jpg", grade: true, pos: "55% 38%", name: "Amara Events", file: "0146",
    q: { sector: "services", monthlySales: 8_000_000, monthlyLeft: 1_600_000, tenure: "established", trend: "growing", withoutYou: "yes", records: "some" },
  },
] as const satisfies readonly { src: string; pos: string; name: string; file: string; grade: boolean; q: QuickInput }[];

const fmt = (n: number) => `₦${Math.round(n / 1_000_000)}M`;
const RANGES = OWNERS.map((o) => {
  const r = quickEstimate(o.q);
  return r.ok ? `${fmt(r.low)} – ${fmt(r.high)}` : "";
});

// the inner folder's colour
const INNER = "#93b99b"; // sage: quiet, now that the documents carry the colour

// the hover tilt (HeroDeck sets --rx/--ry): every folder layer turns about the same centre, so they move as one
function Tilt({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={TILT}>
      {children}
    </div>
  );
}

export default function FileHero({ intro = false }: { intro?: boolean }) {
  // intro: the folder builds itself around the first page after the logo sheet lands on it
  const fx = (ms: number) =>
    intro ? { className: "hero-card absolute inset-0", style: { animationDelay: `${ms}ms` } } : { className: "absolute inset-0" };

  // each time a bundle fully covers the first page, the photo underneath cross-fades to the next owner
  const [tint, setTint] = useState(0);
  useEffect(() => {
    if (!intro) return;
    const onCover = () => setTint((t) => t + 1);
    window.addEventListener("capstack:cover", onCover);
    return () => window.removeEventListener("capstack:cover", onCover);
  }, [intro]);
  const shown = tint % OWNERS.length;
  const owner = OWNERS[shown];

  // the lid: opens slightly when a bundle arrives, closes once it is in
  const [lidOpen, setLidOpen] = useState(false);
  useEffect(() => {
    if (!intro) return;
    let close: number | undefined;
    const onLid = (e: Event) => {
      const ms = (e as CustomEvent<number>).detail ?? 900;
      setLidOpen(true);
      window.clearTimeout(close);
      close = window.setTimeout(() => setLidOpen(false), ms * 0.8);
    };
    window.addEventListener("capstack:lid", onLid);
    return () => {
      window.removeEventListener("capstack:lid", onLid);
      window.clearTimeout(close);
    };
  }, [intro]);

  return (
    <div
      className="relative mx-auto aspect-[10/9.4] w-full max-w-[560px] [clip-path:inset(-400px_-2400px_0_-2400px)]"
      aria-label="Example valuation files for small businesses, each valued in Naira"
      role="img"
    >
      {/* back folders */}
      <div {...fx(4250)}>
      <Tilt>
        <div className="absolute left-[2%] top-[6%] aspect-[500/320] w-[92%]">
          <Folder w={500} h={320} tx={0.5} tw={0.3} th={36} fill="#fbfaf6" stroke="#1d2a22" />
        </div>
        <div className="absolute left-[4%] top-0 aspect-[500/320] w-[92%] [&_path]:transition-[fill] [&_path]:duration-700">
          <Folder w={500} h={320} tx={0.22} tw={0.3} th={36} fill={INNER} />
        </div>
      </Tilt>
      </div>

      {/* the owner's photo, clipped in: it comes in with the folder, so the inner folder never sits empty */}
      <div {...fx(4350)}>
      <Tilt>
      <div
        data-deck-front=""
        className="absolute left-[12%] top-[9%] h-[60%] w-[60%] -rotate-3 rounded-[4px] bg-white p-2 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)]"
      >
        <span aria-hidden className="absolute -top-3 left-6 h-11 w-4 rounded-[10px] border-[2.5px] border-[#9aa39c]" />
        <span className="relative block h-full w-full overflow-hidden rounded-[2px]">
          {OWNERS.map((ph, n) => (
            <span key={ph.src} className="absolute inset-0 transition-opacity duration-200 ease-out" style={{ opacity: n === shown ? 1 : 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.src} alt="" className="h-full w-full object-cover" style={{ objectPosition: ph.pos, filter: ph.grade ? "saturate(0.8) contrast(1.06) brightness(0.97)" : undefined }} />
              {/* the workshop photo's green cast, laid over the others so the set feels shot together */}
              {ph.grade ? <span aria-hidden className="absolute inset-0 bg-[#1f6b3f] mix-blend-soft-light opacity-70" /> : null}
            </span>
          ))}
        </span>
      </div>
      </Tilt>
      </div>

      {/* the paperwork flowing in: over the first page, always under the lid */}
      {intro ? <Conveyor /> : null}

      {intro ? null : (
        <>
          {/* the A4 report, rising out of the file */}
          <div className="file-a4 absolute right-[8%] top-[28%] grid aspect-[1/1.3] w-[44%] content-start gap-1.5 rounded-[3px] bg-white p-3.5 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)]">
            <span className="tab-label !text-[8px] text-ink/50">Valuation report · File №0142</span>
            <b className="text-[17px] font-semibold leading-tight tracking-[-0.02em]">Okafor Woodworks</b>
            <span className="h-[5px] rounded bg-[#ecebe5]" />
            <span className="h-[5px] w-[70%] rounded bg-[#ecebe5]" />
            <span className="num mt-1 font-mono text-[17px] font-medium text-green">₦24M – ₦35M</span>
            <Seal id="hero" className="file-seal absolute bottom-3 right-3 h-16 w-16 text-seal" />
          </div>

          {/* a POS receipt, dropping in */}
          <div className="file-receipt receipt absolute left-[30%] top-[2%] w-[34%] px-3 pb-4 pt-2.5 font-mono text-[10px] leading-[1.7] text-ink shadow-[0_10px_20px_-12px_rgba(0,0,0,0.45)]">
            <div className="mb-1 border-b border-dashed border-ink/25 pb-1 text-center font-semibold tracking-[0.12em]">POS · MAY</div>
            <div className="flex justify-between"><span>SALES</span><span>₦3.5M</span></div>
            <div className="flex justify-between"><span>COSTS</span><span>₦2.6M</span></div>
            <div className="flex justify-between"><span>LEFT</span><span>₦890k</span></div>
          </div>
        </>
      )}

      {/* the lid (front of the folder) */}
      <div {...fx(4450)}>
      <Tilt>
        <div
          className="absolute inset-x-0 bottom-0 h-[47%] origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: lidOpen ? "perspective(900px) rotateX(-16deg)" : "perspective(900px) rotateX(0deg)" }}
        >
          <Folder w={560} h={250} tx={0.06} tw={0.34} th={40} fill="#042e1b" />
          <div className="absolute inset-0 flex flex-col justify-between px-6 pb-5 pt-[54px] text-cream">
            {/* the cover is relabelled for each business as its paperwork is filed */}
            <div key={`h${shown}`} className="lid-swap flex justify-between gap-3 text-sage-soft">
              <span className="tab-label truncate">( {intro ? owner.name : "Okafor Woodworks"} )</span>
              <span className="tab-label shrink-0">File №{intro ? owner.file : "0142"}</span>
            </div>
            <span key={`v${shown}`} className="lid-swap num font-mono text-[clamp(24px,4vw,34px)] font-medium tracking-[-0.03em] text-white">
              {intro ? RANGES[shown] : "₦24M – ₦35M"}
            </span>
          </div>
        </div>
      </Tilt>
      </div>
    </div>
  );
}
