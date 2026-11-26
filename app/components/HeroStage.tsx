import FileHero from "./FileHero";
import { Folder } from "./FilePieces";

/* The hero's stage: a wide file drawer. Its five dividers stand along the top edge (the same five tabs as
   the dashboard), its background is the stack gradient folding in band by band after the logo intro,
   and the living file sits inside with two cards cut into its corners. */

const BANDS = ["#f5f4ee", "#eef0e8", "#e4eadf", "#d8e3d6", "#cadbcb", "#bcd2bf"];
const HEIGHTS = [30, 16, 14, 13, 13, 14]; // % of the stage, top to bottom

const DIVIDERS = [
  { label: "Profile", fill: "#cfc8c0", ink: "#042e1b" },
  { label: "How you make money", fill: "#93b99b", ink: "#042e1b" },
  { label: "Your numbers", fill: "#c9dccb", ink: "#042e1b" },
  { label: "Receipts", fill: "#e8e7df", ink: "#042e1b" },
  { label: "Valuation", fill: "#042e1b", ink: "#d4ed6f" },
];

export default function HeroStage() {
  return (
    <div className="relative mt-12 md:mt-16">
      {/* dividers standing on the drawer's top edge */}
      <div className="relative z-[1] hidden h-10 items-end gap-1 pl-6 md:flex">
        {DIVIDERS.map((d, i) => (
          <a
            key={d.label}
            href="#file"
            className="hero-divider relative block h-10 w-[150px] transition-transform hover:-translate-y-1 lg:w-[176px]"
            style={{ animationDelay: `${3900 + i * 90}ms` }}
          >
            <Folder w={176} h={40} tx={0} tw={1} th={40} fill={d.fill} className="absolute inset-0" />
            <span className="tab-label absolute inset-x-3 top-[15px] truncate text-center" style={{ color: d.ink }}>
              {d.label}
            </span>
          </a>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-[18px] md:rounded-tl-none">
        {/* the stack gradient, folding in band by band */}
        <div aria-hidden className="absolute inset-0 flex flex-col">
          {BANDS.map((c, i) => {
            const h = HEIGHTS[i];
            return (
              <span
                key={c}
                className="hero-band block w-full"
                style={{ background: c, height: `${h}%`, animationDelay: `${3700 + i * 130}ms` }}
              />
            );
          })}
        </div>

        <div className="relative grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* left: the file's cover sheet, cut into the corner */}
          <div className="flex flex-col justify-between gap-8 p-5 md:p-8">
            <div className="hero-card w-full max-w-[340px] rounded-[10px] bg-white p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.45)]" style={{ animationDelay: "4500ms" }}>
              <div className="flex items-center justify-between">
                <span className="tab-label text-ink/45">File №0142</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ink/55">
                  <span className="h-2 w-2 rounded-full bg-pop" /> Valuation ready
                </span>
              </div>
              <p className="mt-4 text-[22px] font-medium leading-tight tracking-[-0.02em] text-green">Okafor Woodworks</p>
              <p className="mt-1 text-[14px] text-ink/55">Furniture workshop · Aba · six years trading</p>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-ink/10 pt-4">
                {[
                  ["12", "answers"],
                  ["7", "receipts"],
                  ["4", "reasons"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="num font-mono text-[20px] font-medium text-green">{n}</p>
                    <p className="text-[12px] text-ink/50">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-card w-full max-w-[340px] rounded-[10px] bg-green p-5 text-cream shadow-[0_16px_40px_-24px_rgba(0,0,0,0.5)]" style={{ animationDelay: "4650ms" }}>
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-cream/70">Confidence</span>
                <span className="num font-mono text-[15px] text-lime">Medium · 58%</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-cream/15">
                <div className="h-full w-[58%] rounded-full bg-lime" />
              </div>
              <p className="mt-3 text-[13px] leading-[1.5] text-cream/65">Add three months of bank statements to raise it to about 76%.</p>
            </div>
          </div>

          {/* right: the living file */}
          <div className="relative flex items-end justify-center px-4 pt-6 lg:justify-end lg:pr-10">
            <div className="hero-card w-full max-w-[540px]" style={{ animationDelay: "4300ms" }}>
              <FileHero />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
