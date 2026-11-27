"use client";

import { useState } from "react";
import { Folder, Seal } from "./FilePieces";
import { quickEstimate, type QuickInput } from "../lib/quickEstimate";

/* The curiosity band: a slow wall of other businesses' files going past, each one valued with the same method
   as the free calculator, then "yours takes two minutes". The businesses are illustrative examples. */

type Example = { name: string; place: string; trade: string; tone: "paper" | "sage" | "lime" | "kraft"; q: QuickInput };

const EXAMPLES: Example[] = [
  { name: "Okafor Woodworks", place: "Aba", trade: "Furniture", tone: "paper",
    q: { sector: "making", monthlySales: 3_500_000, monthlyLeft: 890_000, tenure: "established", trend: "growing", withoutYou: "partly", records: "bank" } },
  { name: "Mama Nkechi's Kitchen", place: "Enugu", trade: "Restaurant", tone: "lime",
    q: { sector: "food", monthlySales: 1_500_000, monthlyLeft: 330_000, tenure: "established", trend: "keeping-up", withoutYou: "no", records: "cash" } },
  { name: "Bright Stars School", place: "Ibadan", trade: "Primary school", tone: "sage",
    q: { sector: "education", monthlySales: 4_000_000, monthlyLeft: 1_400_000, tenure: "established", trend: "growing", withoutYou: "yes", records: "bank" } },
  { name: "Swift Haulage", place: "Kano", trade: "Logistics", tone: "kraft",
    q: { sector: "logistics", monthlySales: 9_000_000, monthlyLeft: 1_350_000, tenure: "mid", trend: "growing", withoutYou: "partly", records: "some" } },
  { name: "Fade Kings Barbers", place: "Abuja", trade: "Barbing salon", tone: "paper",
    q: { sector: "beauty", monthlySales: 900_000, monthlyLeft: 350_000, tenure: "mid", trend: "growing", withoutYou: "no", records: "cash" } },
  { name: "Kola Pharmacy", place: "Ilorin", trade: "Pharmacy", tone: "sage",
    q: { sector: "health", monthlySales: 5_000_000, monthlyLeft: 600_000, tenure: "established", trend: "keeping-up", withoutYou: "partly", records: "bank" } },
  { name: "Amara Events", place: "Lagos", trade: "Events", tone: "lime",
    q: { sector: "services", monthlySales: 8_000_000, monthlyLeft: 1_600_000, tenure: "established", trend: "growing", withoutYou: "yes", records: "some" } },
  { name: "Pixelhaus Studio", place: "Lagos", trade: "Design studio", tone: "kraft",
    q: { sector: "tech", monthlySales: 5_000_000, monthlyLeft: 1_750_000, tenure: "mid", trend: "growing", withoutYou: "partly", records: "bank" } },
];

const TONES = {
  paper: { fill: "#fbfaf6", ink: "#042e1b" },
  sage: { fill: "#c9dccb", ink: "#042e1b" },
  lime: { fill: "#d4ed6f", ink: "#042e1b" },
  kraft: { fill: "#e7d3b0", ink: "#3b2a14" },
};

const m = (n: number) => `₦${Math.round(n / 1_000_000)}M`;

/* The papers a buyer would ask to see. Hovering a file pulls three of them out at random, so no two looks
   are the same. */
type Doc = { title: string; sub: string; kind: "lines" | "table" | "receipt" | "cert" };

const DOCS: Doc[] = [
  { title: "CAC certificate", sub: "RC 1482093", kind: "cert" },
  { title: "Bank statement", sub: "Last 6 months", kind: "table" },
  { title: "POS slips", sub: "October", kind: "receipt" },
  { title: "Tax clearance", sub: "2025", kind: "cert" },
  { title: "Shop lease", sub: "3 years left", kind: "lines" },
  { title: "Stock list", sub: "Counted last week", kind: "table" },
  { title: "Supplier invoices", sub: "12 this quarter", kind: "receipt" },
  { title: "Staff list", sub: "9 people", kind: "table" },
  { title: "Sales book", sub: "Jan – Oct", kind: "lines" },
  { title: "Equipment list", sub: "With what each cost", kind: "table" },
  { title: "Customer contracts", sub: "4 regulars", kind: "lines" },
  { title: "Utility bills", sub: "NEPA and water", kind: "receipt" },
  { title: "Insurance policy", sub: "Fire and theft", kind: "cert" },
  { title: "Sales and costs", sub: "Last 12 months", kind: "table" },
];

function pick(seed?: number) {
  const idx = DOCS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const r = seed === undefined ? Math.random() : ((Math.sin(seed * 97 + i * 13) + 1) / 2) % 1;
    const j = Math.floor(r * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 3);
}

// where each of the three papers lands: fanned out above the folder's mouth
const FAN = [
  { x: -80, y: -128, r: -11 },
  { x: 2, y: -152, r: 2 },
  { x: 82, y: -134, r: 12 },
];

function Paper({ d }: { d: Doc }) {
  const receipt = d.kind === "receipt";
  return (
    <div
      className={`flex h-full flex-col bg-[#fbfaf6] px-3 pt-3 text-[#042e1b] shadow-[0_10px_24px_rgba(0,0,0,0.25)] ${receipt ? "mx-3" : "rounded-[4px]"}`}
      style={receipt ? { clipPath: "polygon(0 0,100% 0,100% 94%,90% 100%,80% 94%,70% 100%,60% 94%,50% 100%,40% 94%,30% 100%,20% 94%,10% 100%,0 94%)" } : undefined}
    >
      <p className="text-[10.5px] font-semibold leading-tight">{d.title}</p>
      <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.08em] opacity-50 truncate">{d.sub}</p>
      <div className="mt-2.5 flex flex-col gap-[5px]">
        {d.kind === "table" &&
          [0.9, 0.7, 0.8, 0.6, 0.85].map((w, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="h-[3px] rounded-full bg-current opacity-15" style={{ width: `${w * 55}%` }} />
              <span className="h-[3px] w-[22%] rounded-full bg-current opacity-30" />
            </div>
          ))}
        {(d.kind === "lines" || d.kind === "cert") &&
          [1, 0.92, 0.97, 0.6].map((w, i) => <span key={i} className="h-[3px] rounded-full bg-current opacity-15" style={{ width: `${w * 100}%` }} />)}
        {receipt &&
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between font-mono text-[7px] opacity-45">
              <span>····</span>
              <span>₦{(i + 2) * 7},{i}00</span>
            </div>
          ))}
      </div>
      {d.kind === "cert" && <span className="mx-auto mt-3 h-7 w-7 rounded-full border-[1.5px] border-current opacity-40" />}
    </div>
  );
}

function FileCard({ e, i, onHold }: { e: Example; i: number; onHold: (held: boolean) => void }) {
  const r = quickEstimate(e.q);
  const t = TONES[e.tone];
  // a fixed first pick keeps the server and browser in step; every hover after that draws again
  const [docs, setDocs] = useState(() => pick(i + 1));
  return (
    <div
      className="wall-card group/card relative aspect-[300/200] w-[300px] shrink-0"
      style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}
      onMouseEnter={() => {
        setDocs(pick());
        onHold(true);
      }}
      onMouseLeave={() => onHold(false)}
    >
      {/* the papers sit inside, hidden behind the folder until hovered */}
      {docs.map((d, k) => (
        <div
          key={k}
          className="absolute left-1/2 top-[44px] -ml-[56px] h-[140px] w-[112px]"
          style={{ ["--x" as string]: `${FAN[k].x}px`, ["--y" as string]: `${FAN[k].y}px`, ["--r" as string]: `${FAN[k].r}deg` }}
        >
          <div className="h-full w-full group-hover/card:[transform:translate(var(--x),var(--y))_rotate(var(--r))] transition-transform duration-500 ease-[cubic-bezier(0.22,1.3,0.36,1)] motion-reduce:transition-none" style={{ transitionDelay: `${k * 60}ms` }}>
            <Paper d={DOCS[d]} />
          </div>
        </div>
      ))}
      <Folder w={300} h={200} tx={0.07} tw={0.42} th={30} fill={t.fill} className="relative drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]" />
      <span className="tab-label absolute left-[28%] top-[8px] -translate-x-1/2 whitespace-nowrap !text-[9px] font-semibold" style={{ color: t.ink }}>
        {e.trade}
      </span>
      <div className="absolute inset-x-0 bottom-0 top-[30px] flex flex-col justify-between px-5 pb-4 pt-4" style={{ color: t.ink }}>
        <div>
          <p className="text-[17px] font-semibold leading-tight tracking-[-0.01em]">{e.name}</p>
          <p className="mt-0.5 text-[13px] opacity-60">{e.place}</p>
        </div>
        <p className="num font-mono text-[22px] font-medium tracking-[-0.03em]">{r.ok ? `${m(r.low)} – ${m(r.high)}` : ""}</p>
      </div>
      <Seal id={`wall-${i}`} className="absolute bottom-3 right-3 h-12 w-12 -rotate-12 opacity-45" style={{ color: t.ink }} />
    </div>
  );
}

export default function FileWall() {
  const row = [...EXAMPLES, ...EXAMPLES];
  // held while a file is hovered, so its papers can be read; done here because the CSS build drops a :has() rule
  const [held, setHeld] = useState(false);
  return (
    <section className="relative overflow-hidden bg-green py-20 text-cream md:py-28">
      <div className="mx-auto max-w-[1320px] px-5 text-center md:px-10">
        <h2 className="display mx-auto max-w-[24ch] text-[clamp(34px,4.2vw,60px)] leading-[1.05]">
          Every business is worth something. Most owners have never found out how much.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-cream/65">
          A barber in Abuja, a school in Ibadan, a kitchen in Enugu. Here&rsquo;s what businesses like theirs are worth. Finding out yours takes two
          minutes.
        </p>
        <a href="#estimate" className="btn btn-lime btn-lg mt-8">
          See what mine is worth
        </a>
      </div>

      {/* the wall: files drifting past. Hovering a file holds the wall still while its papers come out; top
          padding leaves room for them inside the edge fade. */}
      <div className="mt-2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:mt-4">
        <div className="file-wall flex w-max items-center gap-10 pb-6 pt-44" style={{ animationPlayState: held ? "paused" : "running" }}>
          {row.map((e, i) => (
            <FileCard key={i} e={e} i={i} onHold={setHeld} />
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-[12px] text-cream/40">Example businesses, valued with the same method as the free estimate.</p>
    </section>
  );
}
