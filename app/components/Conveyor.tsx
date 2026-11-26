"use client";

import { useEffect, useState } from "react";
import { Seal } from "./FilePieces";

/* Business paperwork passing through the hero's file in tidy bundles of three.

   Sizes are real: every document is drawn in millimetres (an A4 is 210 × 297, a POS slip 80 wide, a sticky
   note 76 square, a kraft file and a binder bigger than A4), inside a bundle box 260 × 330 "mm". The box is
   a size container, so 1 mm = 100cqw / 260 and every width, gap and font scales with the paper.

   The flow goes one way, left to right, and both sides always hold bundles: two wait on the left, the next
   one slides over the folder (growing to the folder's size), sinks behind the dark green lid, rises back
   up, and on the next step slides out to the right, where two filed bundles sit before leaving. The lid
   opens a touch as a bundle goes in and as it comes out (FileHero listens for "capstack:lid").
   Lives inside FileHero over the first page and under the lid. Figures are illustrations. */

const STEP_MS = 3600;
const ENTER_MS = 700;
const SINK_MS = 520;
const RISE_AT = 1500;
const RISE_MS = 650;

const mm = (n: number) => `calc(${n} * 100cqw / 260)`;

type Kind = "report" | "statement" | "binder" | "kraft" | "invoice" | "notebook" | "pos" | "sticky" | "letter" | "form";
type Piece = { kind: Kind; x: number; y: number; r: number; tone?: string };

/* each bundle: a big piece at the back, a medium one, a small one on top */
const BUNDLES: Piece[][] = [
  [
    { kind: "report", x: 12, y: 18, r: -2 },
    { kind: "pos", x: 168, y: 150, r: 5 },
    { kind: "sticky", x: 160, y: 6, r: 7 },
  ],
  [
    { kind: "binder", x: 2, y: 14, r: -2 },
    { kind: "invoice", x: 104, y: 108, r: 4 },
    { kind: "sticky", x: 14, y: 238, r: -6, tone: "#ffb48a" },
  ],
  [
    { kind: "kraft", x: 6, y: 16, r: 1 },
    { kind: "letter", x: 26, y: 206, r: -4 },
    { kind: "pos", x: 176, y: 36, r: 6 },
  ],
  [
    { kind: "statement", x: 8, y: 12, r: 2 },
    { kind: "notebook", x: 108, y: 64, r: 5 },
    { kind: "form", x: 70, y: 226, r: -3 },
  ],
  [
    { kind: "report", x: 30, y: 20, r: 2 },
    { kind: "letter", x: 10, y: 214, r: -3 },
    { kind: "sticky", x: 176, y: 20, r: -5, tone: "#f6b7d2" },
  ],
  [
    { kind: "binder", x: 6, y: 10, r: 2, tone: "#ff8a4c" },
    { kind: "form", x: 96, y: 196, r: -4 },
    { kind: "pos", x: 20, y: 140, r: -5 },
  ],
  [
    { kind: "kraft", x: 12, y: 12, r: -1 },
    { kind: "invoice", x: 100, y: 100, r: 3 },
    { kind: "sticky", x: 150, y: 250, r: 8, tone: "#d4ed6f" },
  ],
];
const N = BUNDLES.length;

const shadow = "0 6px 14px -8px rgba(0,0,0,0.45)";

/* ---------- the documents, in mm ---------- */

function Doc({ kind, tone }: { kind: Kind; tone?: string }) {
  switch (kind) {
    case "report":
      return (
        <div className="relative flex flex-col overflow-hidden bg-white" style={{ width: mm(210), height: mm(297), padding: mm(16), paddingTop: mm(46), gap: mm(8), boxShadow: shadow, borderRadius: mm(2) }}>
          <span className="absolute inset-x-0 top-0 flex items-center bg-green font-mono uppercase text-lime" style={{ height: mm(32), paddingLeft: mm(16), fontSize: mm(7), letterSpacing: "0.1em" }}>Valuation report · File №0142</span>
          <span className="font-semibold leading-tight text-ink" style={{ fontSize: mm(17) }}>Okafor Woodworks</span>
          <Lines n={3} />
          <span className="num font-mono font-medium text-green" style={{ fontSize: mm(15), marginTop: mm(6) }}>₦28M – ₦36M</span>
          <Lines n={4} />
          <span className="absolute" style={{ right: mm(14), bottom: mm(14), width: mm(52), height: mm(52) }}>
            <Seal id="conv-report" className="h-full w-full text-seal" />
          </span>
        </div>
      );
    case "statement":
      return (
        <div className="relative flex flex-col overflow-hidden bg-white" style={{ width: mm(210), height: mm(297), padding: mm(16), paddingTop: mm(44), gap: mm(7), boxShadow: shadow, borderRadius: mm(2) }}>
          <span className="absolute inset-x-0 top-0 flex items-center bg-[#a9c8e8] font-mono uppercase text-[#1d3557]" style={{ height: mm(30), paddingLeft: mm(16), fontSize: mm(7), letterSpacing: "0.1em" }}>Bank statement · April</span>
          {Array.from({ length: 11 }, (_, k) => (
            <span key={k} className="flex justify-between" style={{ gap: mm(8) }}>
              <span className="flex-1 rounded-full bg-[#ecebe5]" style={{ height: mm(4) }} />
              <span className="rounded-full bg-[#dfe6dc]" style={{ height: mm(4), width: mm(36) }} />
            </span>
          ))}
          <span className="mt-auto flex justify-between border-t border-ink/15 font-mono text-ink" style={{ fontSize: mm(9), paddingTop: mm(6) }}>
            <span>Money in</span>
            <span className="font-medium text-green">₦12.4M</span>
          </span>
        </div>
      );
    case "binder":
      return (
        <div className="relative" style={{ width: mm(250), height: mm(305), borderRadius: mm(6), boxShadow: shadow, background: tone ?? "#6f92c6" }}>
          <span aria-hidden className="absolute flex flex-col justify-between" style={{ left: mm(12), top: mm(40), bottom: mm(40) }}>
            {[0, 1, 2].map((n) => (
              <span key={n} className="rounded-full bg-[#2b3f63]" style={{ width: mm(12), height: mm(12) }} />
            ))}
          </span>
          <span className="absolute bg-white text-center" style={{ left: mm(50), right: mm(30), top: mm(40), padding: mm(10), borderRadius: mm(2) }}>
            <span className="block font-mono uppercase text-ink/50" style={{ fontSize: mm(7), letterSpacing: "0.1em" }}>Binder</span>
            <span className="block font-semibold text-ink" style={{ fontSize: mm(15), marginTop: mm(3) }}>Statements 2025</span>
          </span>
        </div>
      );
    case "kraft":
      return (
        <div className="relative" style={{ width: mm(240), height: mm(300), filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.25))" }}>
          <span aria-hidden className="absolute left-0 top-0 bg-[#c49a63]" style={{ width: mm(96), height: mm(30), borderRadius: `${mm(6)} ${mm(6)} 0 0` }} />
          <span className="absolute inset-x-0 bottom-0 bg-[#c49a63]" style={{ top: mm(26), borderRadius: `0 ${mm(5)} ${mm(5)} ${mm(5)}`, padding: mm(18) }}>
            <span className="block bg-[#fbf5ea]" style={{ padding: mm(10), borderRadius: mm(2) }}>
              <span className="block font-mono uppercase text-ink/50" style={{ fontSize: mm(7), letterSpacing: "0.1em" }}>File</span>
              <span className="block font-semibold text-ink" style={{ fontSize: mm(14), marginTop: mm(2) }}>Licences &amp; permits</span>
            </span>
            <span
              className="absolute font-semibold uppercase text-[#7a1f1f]"
              style={{ right: mm(18), bottom: mm(22), fontSize: mm(10), letterSpacing: "0.12em", border: `${mm(2)} solid #7a1f1f`, padding: `${mm(2)} ${mm(6)}`, transform: "rotate(-10deg)" }}
            >
              Valid
            </span>
          </span>
        </div>
      );
    case "invoice":
      return (
        <div className="flex flex-col" style={{ width: mm(148), height: mm(210), padding: mm(12), gap: mm(6), boxShadow: shadow, borderRadius: mm(2), background: "#f7dbe5" }}>
          <span className="flex items-baseline justify-between">
            <span className="font-semibold text-green" style={{ fontSize: mm(14) }}>Invoice</span>
            <span className="font-mono text-ink/45" style={{ fontSize: mm(7) }}>#0087</span>
          </span>
          <span className="text-ink/60" style={{ fontSize: mm(8) }}>Lekki Hotels Ltd · 40 chairs</span>
          <Lines n={5} />
          <span className="mt-auto flex justify-between border-t border-ink/15 font-mono text-ink" style={{ fontSize: mm(9), paddingTop: mm(5) }}>
            <span>Total</span>
            <span className="font-medium">₦640,000</span>
          </span>
        </div>
      );
    case "notebook":
      return (
        <div className="relative bg-[#e4f2e6]" style={{ width: mm(148), height: mm(210), boxShadow: shadow }}>
          <span
            aria-hidden
            className="absolute inset-x-0"
            style={{ top: mm(6), height: mm(8), backgroundImage: `radial-gradient(circle, #042e1b ${mm(2.6)}, transparent ${mm(3)})`, backgroundSize: `${mm(12)} ${mm(8)}` }}
          />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0"
            style={{ top: mm(24), backgroundImage: `linear-gradient(transparent calc(${mm(14)} - 1px), #c9d9e8 calc(${mm(14)} - 1px))`, backgroundSize: `100% ${mm(14)}` }}
          />
          <span className="relative block font-mono text-[#34406b]" style={{ padding: `${mm(26)} ${mm(12)} 0`, fontSize: mm(8), lineHeight: mm(14) }}>
            Regular customers
            <br />Lekki Hotels · weekly
            <br />Grace Tailoring · monthly
            <br />Ada &amp; Sons · on call
          </span>
        </div>
      );
    case "pos":
      return (
        <div className="receipt font-mono text-ink" style={{ width: mm(80), padding: `${mm(8)} ${mm(7)} ${mm(12)}`, fontSize: mm(7), lineHeight: 1.7, boxShadow: shadow }}>
          <span className="block border-b border-dashed border-ink/25 text-center font-semibold" style={{ letterSpacing: "0.12em", paddingBottom: mm(3), marginBottom: mm(3) }}>
            POS · MAY
          </span>
          <span className="flex justify-between"><span>SALES</span><span>₦3.5M</span></span>
          <span className="flex justify-between"><span>COSTS</span><span>₦2.6M</span></span>
          <span className="flex justify-between"><span>LEFT</span><span>₦890k</span></span>
          <span className="block border-t border-dashed border-ink/25 text-center text-ink/50" style={{ marginTop: mm(3), paddingTop: mm(3) }}>
            THANK YOU
          </span>
        </div>
      );
    case "sticky":
      return (
        <div className="flex flex-col justify-between text-ink/80" style={{ width: mm(76), height: mm(76), padding: mm(8), boxShadow: shadow, background: tone ?? "#f4e98a" }}>
          <span className="leading-snug" style={{ fontSize: mm(8) }}>60 more chairs for Lekki, March.</span>
          <span className="font-mono uppercase text-ink/50" style={{ fontSize: mm(5.5), letterSpacing: "0.1em" }}>Repeat</span>
        </div>
      );
    case "letter":
      return (
        <div className="relative bg-[#f5c9a1]" style={{ width: mm(220), height: mm(110), boxShadow: shadow, borderRadius: mm(2) }}>
          <span aria-hidden className="absolute inset-0 bg-[#eab486] [clip-path:polygon(0_0,100%_0,50%_56%)]" />
          <span className="absolute border-dashed border-pop/70 bg-pop/10" style={{ right: mm(12), top: mm(10), width: mm(22), height: mm(26), borderWidth: mm(1.5) }} />
          <span className="absolute font-mono text-ink/70" style={{ left: mm(16), bottom: mm(14), fontSize: mm(7), lineHeight: 1.6 }}>
            TO: OKAFOR WOODWORKS
            <br />
            12 FACTORY ROAD, ABA
          </span>
        </div>
      );
    case "form":
      return (
        <div className="font-mono text-ink" style={{ width: mm(150), padding: mm(8), background: "#dbe8f5", boxShadow: shadow }}>
          {[
            ["BUSINESS", "OKAFOR WOODWORKS"],
            ["TRADE", "FURNITURE"],
            ["CITY", "ABA, ABIA"],
          ].map(([k, v], n) => (
            <span
              key={k}
              className="grid border-solid border-ink/40"
              style={{ gridTemplateColumns: `${mm(40)} 1fr`, borderWidth: 1, borderBottomWidth: n === 2 ? 1 : 0 }}
            >
              <span className="border-r border-ink/40 text-ink/55" style={{ fontSize: mm(5.5), padding: mm(3), letterSpacing: "0.08em" }}>{k}</span>
              <span className="font-medium" style={{ fontSize: mm(7), padding: mm(3) }}>{v}</span>
            </span>
          ))}
        </div>
      );
  }
}

function Lines({ n }: { n: number }) {
  return (
    <span className="flex flex-col" style={{ gap: mm(5) }}>
      {Array.from({ length: n }, (_, k) => (
        <span key={k} className="rounded-full bg-[#ecebe5]" style={{ height: mm(4), width: k === n - 1 ? "62%" : "100%" }} />
      ))}
    </span>
  );
}

/* A bundle: a 260 × 330 mm box; each piece at its spot, real size. */
/* Before the intro ends, every piece waits off in its own direction; when `assembled` turns on they all
   drift in softly to their places at about the same time, each slightly displaced in time. */
function Bundle({ pieces, assembled, order }: { pieces: Piece[]; assembled: boolean; order: number }) {
  return (
    <div className="relative w-full" style={{ containerType: "inline-size", aspectRatio: "260 / 330" }}>
      {pieces.map((p, i) => {
        const seed = order * 3 + i;
        // everything comes in together, each piece a touch early or late (0–260 ms), so it feels natural
        const jitter = ((seed * 53) % 7) * 43;
        const angle = (seed * 137.5 * Math.PI) / 180; // golden-angle spread: every piece from a different side
        const away = `translate(${Math.round(Math.cos(angle) * 1600)}px, ${Math.round(Math.sin(angle) * 1100)}px) rotate(${p.r + (seed % 2 ? 24 : -24)}deg)`;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: mm(p.x),
              top: mm(p.y),
              transform: assembled ? `rotate(${p.r}deg)` : away,
              opacity: assembled ? 1 : 0,
              // a long, soft landing: fast at first, then easing off very gradually until it settles (expo-style ease-out)
              transition: `transform ${1900 + jitter * 2}ms cubic-bezier(0.05,0.7,0.1,1) ${jitter}ms, opacity 900ms ease-out ${jitter}ms`,
            }}
          >
            <Doc kind={p.kind} tone={p.tone} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- the flow ---------- */

type Sub = "enter" | "sink" | "rise";
const OUT = 0.32; // outside the folder: about 60% smaller than before (and well under the size it has inside)

/* Places in the line (k), one step apart:
   0 in the file · 1 just out, right · 2 further right · 3 leaving right (fades) ·
   4 out of sight (jumps to the far left) · 5 far left (fades in) · 6 next to go in, left */
function place(k: number, sub: Sub) {
  if (k === 0) return sub === "sink" ? { x: 54, y: 108, s: 1, r: 0, o: 1 } : { x: 54, y: 40, s: 1, r: 0, o: 1 };
  const table: Record<number, { x: number; y: number; s: number; r: number; o: number }> = {
    1: { x: 124, y: 58, s: OUT, r: 4, o: 1 },
    2: { x: 158, y: 62, s: OUT * 0.92, r: -3, o: 1 },
    3: { x: 196, y: 60, s: OUT * 0.88, r: 3, o: 0 },
    4: { x: -96, y: 60, s: OUT * 0.88, r: -3, o: 0 },
    5: { x: -58, y: 62, s: OUT * 0.92, r: 3, o: 1 },
    6: { x: -22, y: 58, s: OUT, r: -4, o: 1 },
  };
  return table[k];
}

export default function Conveyor({ startAfter = 4400 }: { startAfter?: number }) {
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState<Sub>("rise");
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let tick: number | undefined;
    const lid = (ms: number) => window.dispatchEvent(new CustomEvent("capstack:lid", { detail: ms }));
    timers.push(
      window.setTimeout(() => {
        timers.push(window.setTimeout(() => setAssembled(true), 40));
        if (reduce) return;
        tick = window.setInterval(() => {
          setStep((n) => n + 1);
          setSub("enter");
          lid(ENTER_MS + SINK_MS + 120); // opens as it goes in, closes once it is down
          // the photo swaps as the bundle reaches the point where it covers the first page; the quick fade finishes
          // just as it starts to sink, so you only notice the new photo as the bundle goes down
          timers.push(window.setTimeout(() => window.dispatchEvent(new Event("capstack:cover")), ENTER_MS - 180));
          timers.push(
            window.setTimeout(() => {
              setSub("sink");
            }, ENTER_MS),
          );
          timers.push(
            window.setTimeout(() => {
              setSub("rise");
              lid(RISE_MS + 120); // opens again as it comes back up
            }, RISE_AT),
          );
        }, STEP_MS);
      }, reduce ? 0 : startAfter),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      if (tick) window.clearInterval(tick);
    };
  }, [startAfter]);

  const ease = "cubic-bezier(0.55,0,0.25,1)";

  return (
    // its own layer at z 0, so the lid (later in FileHero) always covers it
    <div aria-hidden className="absolute inset-0 z-0">
      {BUNDLES.map((pieces, i) => {
        // the bundle at step % N is in the file; k counts how far along the line each bundle is
        const k = (((step - i) % N) + N) % N;
        const p = place(k, sub);
        let transition = `left ${ENTER_MS}ms ${ease}, top ${ENTER_MS}ms ${ease}, transform ${ENTER_MS}ms ${ease}, opacity 450ms ease`;
        if (k === 4) transition = "none"; // out of sight: jump across
        if (k === 0 && sub === "sink") transition = `top ${SINK_MS}ms cubic-bezier(0.5,0,0.75,0.4)`;
        if (k === 0 && sub === "rise") transition = `top ${RISE_MS}ms cubic-bezier(0.25,0.6,0.3,1)`;
        return (
          <div
            key={i}
            className="absolute w-[76%]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.o,
              zIndex: k === 0 ? 3 : 1,
              transform: `translate(-50%, -50%) rotate(${p.r}deg) scale(${p.s})`,
              transition,
            }}
          >
            <Bundle pieces={pieces} assembled={assembled} order={i} />
          </div>
        );
      })}
    </div>
  );
}
