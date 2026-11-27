import { ARROW, LETTERS } from "./logoIntroData";

/* The logo intro's timeline, the same as the Cavalry scene (docs/brand/motion/capstack-logo-intro.cv), counted in
   its 25 fps frames:
   - 12–116  the pen writes "Capstack" as one continuous, softly eased movement; four sage sheets run ahead of the ink
   - 110–134 the arrow drifts in along its diagonal
   - 140–182 the C and the k + arrow push together; the letters between slide into each other and fade
   - 168–204 the Ck lockup settles into the centre and keeps scaling out, fading away from 174 to 198
   - 198     the paper starts dissolving once the Ck is gone, so nothing of the logo is left as the hero builds */

export const FPS = 25;
export const HANDOFF_FRAME = 198;
export const INTRO_MS = (HANDOFF_FRAME / FPS) * 1000;
export const END_FRAME = 204; // the Ck has scaled out (and long faded) by here
export const END_MS = (END_FRAME / FPS) * 1000;

export const SHEETS = ["#d8e3d6", "#cadbcb", "#bcd2bf", "#93b99b"]; // the homepage's stacked sheets, light to deep
const LEAD = [64, 48, 32, 16]; // how far each sheet runs ahead of the ink along the pen's path (logo px)
export const PEN_WIDTH = 40;

const W0 = 12, W1 = 116;
const BREATH_STROKE = 8, BREATH_LETTER = 16; // unseen length between strokes, so the pen eases past instead of stopping
const A0 = 110, A1 = 134;
const P0 = 140, P1 = 182;
const G0 = 168;
const CENTRE_BY = 198; // the Ck has moved into the middle of the frame by here
const FADE0 = 174, FADE1 = 198;
const SCALE_OUT = 2.6; // how big the Ck gets as it leaves

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
const quadInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const quintInOut = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
const quintOut = (t: number) => 1 - (1 - t) ** 5;

const parse = (s: string) => s.split(" ").map((p) => p.split(",").map(Number));
const length = (pts: number[][]) => pts.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// where each stroke starts and ends along the one path through the word
const strokes: { letter: number; a: number; b: number }[] = [];
{
  let s = 0;
  LETTERS.forEach((L, li) =>
    L.pens.forEach((pen, j) => {
      if (strokes.length) s += j === 0 ? BREATH_LETTER : BREATH_STROKE;
      const len = length(parse(pen));
      strokes.push({ letter: li, a: s, b: s + len });
      s += len;
    }),
  );
}
const TOTAL = strokes[strokes.length - 1].b;

// time → distance along the path: a soft ease that never stalls (part linear, part sine)
function dist(f: number) {
  const t = span(f, W0, W1);
  return TOTAL * (0.55 * t + 0.45 * (1 - Math.cos(Math.PI * t)) / 2);
}
function frameAt(d: number) {
  let f = W0;
  while (f < W1 && dist(f) < d) f++;
  return f;
}
const inkDone = LETTERS.map((_, li) => frameAt(Math.max(...strokes.filter((s) => s.letter === li).map((s) => s.b))));

// the squeeze: C from the left, k and the arrow from the right, closing to the Ck icon's spacing
const box = (n: string) => LETTERS.find((l) => l.name === n)!.box;
const [cL, cT, cR, cB] = box("C");
const [kL, , kR] = box("k");
const [aL, , aR] = ARROW.box;
const centreX = (Math.min(...LETTERS.map((l) => l.box[0])) + aR) / 2;
const centreY = (Math.min(...LETTERS.map((l) => l.box[1])) + Math.max(...LETTERS.map((l) => l.box[3]), ARROW.box[3])) / 2;
const gap = 0.08 * (cB - cT);
const total = cR - cL + gap + (kR - kL) + (aL - kR) + (aR - aL);
const cLeft = centreX - total / 2;
const dC = cLeft - cL;
const dK = cLeft + (cR - cL) + gap - kL;
const meet = cLeft + (cR - cL) + gap / 2;

export const VIEWBOX = { x: centreX - 470, y: centreY - 122, w: 940, h: 244 };

export type IntroState = {
  /** per letter: sideways shift, opacity, and per layer (4 sheets then ink) each stroke's drawn share 0–1 */
  letters: { dx: number; opacity: number; sheetOpacity: number; layers: number[][] }[];
  arrow: { dx: number; dy: number; scale: number; opacity: number };
  /** the whole logo: scale about the word's centre, then a vertical shift that centres the Ck */
  logo: { scale: number; dy: number; cx: number; cy: number; opacity: number };
};

export function introState(f: number): IntroState {
  const d = dist(f);
  const push = quintInOut(span(f, P0, P1));
  const letters = LETTERS.map((L, li) => {
    const own = strokes.filter((s) => s.letter === li);
    const layers = [...LEAD, 0].map((lead) => own.map((s) => clamp((d + lead - s.a) / (s.b - s.a))));
    const middle = L.name !== "C" && L.name !== "k";
    const lx = (L.box[0] + L.box[2]) / 2;
    const dx = L.name === "C" ? dC * push : L.name === "k" ? dK * push : (meet - lx) * push;
    return {
      dx,
      opacity: middle ? 1 - quadInOut(span(f, P0 + 6, P0 + 30)) : 1,
      // once the ink has written a letter, its sage copies fade so no fringe is left around it
      sheetOpacity: 1 - quadInOut(span(f, inkDone[li], inkDone[li] + 12)),
      layers,
    };
  });
  const arrive = quintOut(span(f, A0, A1));
  const lift = 46 / 1.45; // the Cavalry offset, in logo px
  // one unbroken move: slow at first, then gathering pace as the Ck scales out toward you
  const k = 1 + (SCALE_OUT - 1) * span(f, G0, END_FRAME) ** 2.4;
  const centre = quadInOut(span(f, G0, CENTRE_BY));
  return {
    letters,
    arrow: {
      dx: lift * (1 - arrive) + dK * push,
      dy: lift * (1 - arrive),
      scale: 0.7 + 0.3 * arrive,
      opacity: quadInOut(span(f, A0, A0 + 12)),
    },
    logo: {
      scale: k,
      dy: (centreY - (cT + cB) / 2) * k * centre,
      cx: centreX,
      cy: centreY,
      opacity: 1 - quadInOut(span(f, FADE0, FADE1)),
    },
  };
}
