/* Capstack "On file" building blocks: the folder silhouette, the seal and the brand arrow.
   All plain SVG, so they work in server components. */

/** The path of a file folder with one tab, in a w × h box. Tab starts at tx (0–1) and is tw wide. */
export function folderPath(w: number, h: number, tx: number, tw: number, th: number) {
  const r = Math.min(14, h / 6);
  const a = tx * w;
  const b = Math.min(w - 6, a + tw * w);
  const s = th * 0.62;
  const o = 0.5;
  const W = w - o;
  const H = h - o;
  return [
    `M${o} ${th + r}`,
    `Q${o} ${th} ${r + o} ${th}`,
    `H${Math.max(r, a - 6)}`,
    `Q${a + 1} ${th} ${a + 5} ${th - 6}`,
    `L${a + s - 5} ${6 + o}`,
    `Q${a + s} ${o} ${a + s + 9} ${o}`,
    `H${b - s - 9}`,
    `Q${b - s} ${o} ${b - s + 5} ${6 + o}`,
    `L${b - 5} ${th - 6}`,
    `Q${b - 1} ${th} ${Math.min(W - r, b + 6)} ${th}`,
    `H${W - r}`,
    `Q${W} ${th} ${W} ${th + r}`,
    `V${H - r}`,
    `Q${W} ${H} ${W - r} ${H}`,
    `H${r + o}`,
    `Q${o} ${H} ${o} ${H - r}`,
    "Z",
  ].join(" ");
}

type FolderProps = {
  /** viewBox width and height: the element must keep this aspect ratio. */
  w: number;
  h: number;
  tx?: number;
  tw?: number;
  th?: number;
  fill?: string;
  stroke?: string;
  className?: string;
  style?: React.CSSProperties;
};

/** A folder silhouette that stretches to its box (give the box the same aspect as w × h). */
export function Folder({ w, h, tx = 0.06, tw = 0.32, th = 40, fill = "none", stroke, className = "", style }: FolderProps) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={`block h-full w-full overflow-visible ${className}`}
      style={style}
      aria-hidden
    >
      <path
        d={folderPath(w, h, tx, tw, th)}
        fill={fill}
        stroke={stroke ?? "none"}
        strokeWidth={stroke ? 1 : 0}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Capstack's arrow (from the wordmark). */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M0 0H100V32H54L94 72L72 94L32 54V100H0Z" fill="currentColor" />
    </svg>
  );
}

/** The seal: "Valued · on file · Capstack" around the arrow. Pass a unique id per page. */
export function Seal({ id, className = "", style }: { id: string; className?: string; style?: React.CSSProperties }) {
  const ring = `seal-ring-${id}`;
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} role="img" aria-label="Valued, on file, Capstack">
      <defs>
        <path id={ring} d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontFamily="var(--font-mono-face), monospace" fontSize="9.6" fontWeight="600" letterSpacing="2.2" fill="currentColor">
        <textPath href={`#${ring}`}>VALUED · ON FILE · CAPSTACK ·</textPath>
      </text>
      <g transform="translate(39 39) scale(.22)">
        <path d="M0 0H100V32H54L94 72L72 94L32 54V100H0Z" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Headline full stop, in the headline's own colour. */
export function Stop({ char = "." }: { char?: string }) {
  return <span className="stop">{char}</span>;
}

/** The hero's hover tilt, read from --rx/--ry (set by HeroDeck). */
export const TILT = {
  transform: "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
  transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
} as const;
