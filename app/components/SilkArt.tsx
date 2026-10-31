/* Soft silk-like light bands in the brand greens: one technique, three moods.
   Shared by the homepage feature cards and the valuation demo. Server-safe. */

type Silk = {
  id: string;
  base: [string, string];
  bands: { d: string; color: string; opacity: number; blur: number }[];
};

export type SilkMood = "forest" | "sage" | "deep";

const SILK: Record<SilkMood, Silk> = {
  forest: {
    id: "silk-forest",
    base: ["#174a2c", "#0b2817"],
    bands: [
      { d: "M-80 420 C 80 300, 220 520, 380 360 S 620 240, 640 160 L 640 640 L -80 640 Z", color: "#2f8a52", opacity: 0.9, blur: 36 },
      { d: "M-60 250 C 90 150, 210 330, 360 210 S 560 80, 640 40", color: "#c8e043", opacity: 0.55, blur: 42, },
      { d: "M-60 330 C 100 240, 230 400, 380 290 S 580 170, 640 120", color: "#d8eed1", opacity: 0.45, blur: 18 },
      { d: "M-60 352 C 100 262, 230 422, 380 312 S 580 192, 640 142", color: "#ffffff", opacity: 0.6, blur: 1.2 },
    ],
  },
  sage: {
    id: "silk-sage",
    base: ["#e6efe1", "#a9d3b2"],
    bands: [
      { d: "M-80 520 C 120 380, 260 560, 420 420 S 600 300, 640 280 L 640 640 L -80 640 Z", color: "#5cb177", opacity: 0.7, blur: 40 },
      { d: "M-60 140 C 120 60, 260 220, 420 120 S 600 40, 640 20", color: "#ffffff", opacity: 0.95, blur: 40 },
      { d: "M-60 470 C 110 360, 250 520, 410 390 S 590 280, 640 250", color: "#f3e8d3", opacity: 0.7, blur: 16 },
      { d: "M-60 488 C 110 378, 250 538, 410 408 S 590 298, 640 268", color: "#ffffff", opacity: 0.85, blur: 1.2 },
    ],
  },
  deep: {
    id: "silk-deep",
    base: ["#123d24", "#071a0f"],
    bands: [
      { d: "M-80 180 C 100 320, 260 120, 420 260 S 600 420, 640 460 L 640 -40 L -80 -40 Z", color: "#1f6e3d", opacity: 0.9, blur: 36 },
      { d: "M-60 520 C 120 420, 260 600, 420 470 S 600 380, 640 360", color: "#d3e88a", opacity: 0.45, blur: 44 },
      { d: "M-60 230 C 100 360, 260 160, 420 300 S 600 460, 640 500", color: "#a7efce", opacity: 0.4, blur: 16 },
      { d: "M-60 248 C 100 378, 260 178, 420 318 S 600 478, 640 518", color: "#ffffff", opacity: 0.5, blur: 1.2 },
    ],
  },
};

export default function SilkArt({ mood }: { mood: SilkMood }) {
  const s = SILK[mood];
  return (
    <svg
      viewBox="0 0 560 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${s.id}-base`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={s.base[0]} />
          <stop offset="1" stopColor={s.base[1]} />
        </linearGradient>
        {s.bands.map((b, i) => (
          <filter key={i} id={`${s.id}-b${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={b.blur} />
          </filter>
        ))}
      </defs>
      <rect width="560" height="600" fill={`url(#${s.id}-base)`} />
      {s.bands.map((b, i) => {
        const open = !b.d.includes("Z");
        const sheen = open && b.blur < 10;
        // Fine sheen lines: a few parallel strands fanning out from the
        // highlight, so the band reads like light across folded silk.
        const strands = sheen ? [0, 1, 2, 3, 4] : [0];
        return strands.map((k) => (
          <path
            key={`${i}-${k}`}
            d={b.d}
            transform={k ? `translate(0 ${k * 16}) rotate(${k * 0.8} 280 300)` : undefined}
            fill={open ? "none" : b.color}
            stroke={open ? b.color : "none"}
            strokeWidth={open ? (sheen ? 1.6 - k * 0.2 : 70) : 0}
            strokeLinecap="round"
            opacity={b.opacity * (sheen ? 1 - k * 0.17 : 1)}
            filter={`url(#${s.id}-b${i})`}
          />
        ));
      })}
    </svg>
  );
}
