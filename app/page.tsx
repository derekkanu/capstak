import FadeIn from "./components/FadeIn";
import WaitlistForm from "./components/WaitlistForm";
import DemoLauncher from "./components/DemoLauncher";
import ValuationPlayground from "./components/ValuationPlayground";
import ValuationMethod from "./components/ValuationMethod";
import ParticleField from "./components/ParticleField";
import SilkArt from "./components/SilkArt";

export default function Home() {
  return (
    <main className="flex flex-col text-ink">
      <Header />
      <Hero />
      <FeatureCards />
      <ValuationMethod />
      <Engine />
      <Audiences />
      <Pricing />
      <Footer />
    </main>
  );
}

/* ---------------- Header ---------------- */

function Logo({
  className = "",
  tone = "ink",
  size = 28,
}: {
  className?: string;
  tone?: "ink" | "white";
  size?: number;
}) {
  const src =
    tone === "white" ? "/logo-capstack-cream.png" : "/logo-capstack.png";
  const aspect = tone === "white" ? 1694 / 516 : 1078 / 356;
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt="Capstack"
        draggable={false}
        style={{
          height: `${size}px`,
          width: `${size * aspect}px`,
        }}
      />
    </div>
  );
}


const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#method", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#waitlist", label: "Contact" },
];

function Header() {
  return (
    <div className="entrance-nav sticky top-0 z-40 w-full">
      <AnnouncementBar />
      <header className="border-b border-ink/[0.06] bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[68px] md:px-8">
          <a href="#" aria-label="Capstack home" className="flex items-center">
            <Logo size={38} />
          </a>
          <nav className="hidden items-center gap-9 text-[15px] text-ink/70 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#waitlist"
              className="hidden rounded-[8px] bg-ink/[0.06] px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-ink/[0.1] md:inline-block"
            >
              Join waitlist
            </a>
            <span className="hidden md:block">
              <DemoLauncher size="md" />
            </span>
            <span className="md:hidden">
              <DemoLauncher size="sm" />
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}

function AnnouncementBar() {
  return (
    <a
      href="#waitlist"
      className="group block bg-green px-4 py-2 text-center text-[13px] text-cream/80 transition-colors hover:text-cream"
    >
      <span className="hidden sm:inline">Capstak is opening early access to guided AI valuations.</span>
      <span className="sm:hidden">Early access is opening.</span>
      <span className="ml-1.5 font-medium text-lime">
        Get notified{" "}
        <span className="inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
      </span>
    </a>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="entrance-card-text mx-auto flex max-w-[1000px] flex-col items-center text-center">
          <h1 className="entrance-heading display text-[46px] text-ink sm:text-[64px] md:text-[84px] lg:text-[96px]">
            Effortless valuations, accurate results
          </h1>
          <p className="entrance-body mt-6 max-w-[36rem] text-[17px] leading-[1.55] text-ink/55 md:text-[19px]">
            Answer a few plain-English questions and get a clear, explainable valuation of your
            business. No spreadsheets, no jargon.
          </p>
          <div className="entrance-form mt-9 flex flex-wrap items-center justify-center gap-3">
            <DemoLauncher size="lg">Explore Demo</DemoLauncher>
            <a
              href="#waitlist"
              className="rounded-[8px] bg-ink/[0.06] px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-ink/[0.1]"
            >
              Join the waitlist
            </a>
          </div>
        </div>

        <div className="entrance-card-image mt-14 md:mt-20">
          <ValuationPlayground />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Shared section heading ---------------- */

function SectionHead({
  title,
  sub,
  align = "left",
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <FadeIn className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start"}`}>
      <h2 className="display max-w-[20ch] text-[38px] text-ink md:text-[52px] lg:text-[60px]">{title}</h2>
      {sub ? (
        <p className="mt-5 max-w-[38rem] text-[16px] leading-[1.6] text-ink/55 md:text-[18px]">{sub}</p>
      ) : null}
    </FadeIn>
  );
}

/* ---------------- Feature cards (Exa "Designed to…" pattern) ---------------- */

function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-ink underline decoration-[#2a9d4f]/60 decoration-[1.5px] underline-offset-[5px]">
      {children}
    </span>
  );
}

function CardButton({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-[6px] bg-ink/[0.06] px-4 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-ink/[0.1]";
  return href ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <DemoLauncher variant="plain" className={cls}>
      {children}
    </DemoLauncher>
  );
}

function FeatureCards() {
  const cards = [
    {
      title: "Answer in plain English",
      body: (
        <>
          No forms or spreadsheets. A friendly AI asks <Accent>one simple question at a time</Accent>{" "}
          and happily takes rough estimates.
        </>
      ),
      cta: <CardButton>Start the interview &rarr;</CardButton>,
      Art: ArtConversation,
    },
    {
      title: "The facts that matter, captured",
      body: (
        <>
          As you chat, Capstack picks out <Accent>revenue, margins, debt and growth</Accent>, so
          nothing important slips through.
        </>
      ),
      cta: <CardButton href="#method">See how it&rsquo;s calculated &rarr;</CardButton>,
      Art: ArtHighlights,
    },
    {
      title: "A valuation you can stand behind",
      body: (
        <>
          Get a low, mid and high range with <Accent>the reasoning behind it</Accent>, ready to share
          with buyers, brokers or investors.
        </>
      ),
      cta: <CardButton href="#waitlist">Get early access &rarr;</CardButton>,
      Art: ArtReport,
    },
  ];
  return (
    <section id="product" className="scroll-mt-28 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead align="center" title="Designed to make valuation effortless" />
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-20 md:grid-cols-3">
          {cards.map((c, i) => (
            <FadeIn key={c.title} delay={i * 90} className="flex h-full flex-col">
              <div className="grain relative aspect-[5/6] overflow-hidden rounded-[4px]">
                <c.Art />
              </div>
              <h3 className="mt-7 text-[22px] font-medium tracking-[-0.01em] text-ink md:text-[24px]">
                {c.title}
              </h3>
              <p className="mt-3 max-w-[40ch] text-[16px] leading-[1.6] text-ink/60 md:text-[17px]">
                {c.body}
              </p>
              <div className="mt-6">{c.cta}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Art panels: soft silk-like light bands in the brand greens (one technique,
   three moods), with the product UI centred on a shared inset grid. */

/* Shared inset: every panel's UI sits centred, 8% in from each edge. */
function ArtStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-[2] flex items-center justify-center p-[8%]">
      <div className="w-full">{children}</div>
    </div>
  );
}

const panelShadow = "shadow-[0_24px_60px_-28px_rgba(6,20,12,0.6)]";

function ArtConversation() {
  return (
    <div className="absolute inset-0">
      <SilkArt mood="forest" />
      <ArtStage>
        <div className={`overflow-hidden rounded-[8px] bg-white ${panelShadow}`}>
          <div className="flex items-center gap-2.5 border-b border-ink/[0.07] px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-[11px] font-semibold text-lime">
              C
            </span>
            <span className="text-[13px] font-medium text-ink">Valuation interview</span>
            <span className="ml-auto text-[12px] text-ink/40">Financials</span>
          </div>
          <div className="flex flex-col gap-2.5 p-4 text-[13px] leading-[1.45] md:text-[14px]">
            <p className="max-w-[85%] rounded-[10px] rounded-tl-[3px] bg-[#f1efe8] px-3.5 py-2.5 text-ink/80">
              Roughly what does a normal month of sales look like?
            </p>
            <p className="ml-auto max-w-[80%] rounded-[10px] rounded-tr-[3px] bg-green px-3.5 py-2.5 text-cream">
              About $42k, a bit more in summer.
            </p>
            <p className="max-w-[85%] rounded-[10px] rounded-tl-[3px] bg-[#f1efe8] px-3.5 py-2.5 text-ink/80">
              Perfect, an estimate is fine. And after costs, what do you keep?
            </p>
          </div>
          <div className="flex items-center gap-2 border-t border-ink/[0.07] px-4 py-3 text-[13px] text-ink/35">
            Type your answer…
            <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-[6px] bg-green text-lime">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </ArtStage>
    </div>
  );
}

function ArtHighlights() {
  const mark = "rounded-[2px] bg-lime/70 px-0.5 text-ink";
  return (
    <div className="absolute inset-0">
      <SilkArt mood="sage" />
      <ArtStage>
        <div className={`rounded-[8px] bg-white p-5 md:p-6 ${panelShadow}`}>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[12px] font-medium text-ink/50">
              <span className="h-2 w-2 rounded-[2px] bg-[#2a9d4f]" />
              Interview notes
            </p>
            <p className="text-[12px] text-ink/40">5 facts found</p>
          </div>
          <p className="display mt-3 text-[24px] text-ink md:text-[26px]">Riverside Café</p>
          <p className="mt-2 text-[13px] leading-[1.7] text-ink/65 md:text-[14px]">
            We&rsquo;ve been open <span className={mark}>six years</span> on the same corner. Sales
            last month were about <span className={mark}>$42k</span>, up from{" "}
            <span className={mark}>$36k</span> in spring. After wages and rent we keep roughly{" "}
            <span className={mark}>18%</span>, and we still owe <span className={mark}>$20k</span> on
            the espresso machines.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink/[0.07] pt-4 text-[12px]">
            {[
              ["Monthly revenue", "$42k"],
              ["Margin", "18%"],
              ["Years trading", "6"],
              ["Debt", "$20k"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-[6px] bg-[#f4f5f1] px-2.5 py-1.5">
                <span className="text-ink/55">{k}</span>
                <span className="num font-medium text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </ArtStage>
    </div>
  );
}

function ArtReport() {
  const rows: [string, string, boolean?][] = [
    ["Range", "$193k – $262k"],
    ["Sector benchmark", "2.1×"],
    ["Revenue growing", "+0.5×", true],
    ["Six years trading", "+0.3×", true],
    ["Your multiple", "2.9×"],
  ];
  return (
    <div className="absolute inset-0">
      <SilkArt mood="deep" />
      <ArtStage>
        <div className={`overflow-hidden rounded-[8px] bg-[#0b140e]/95 text-[13px] text-cream/80 ring-1 ring-cream/10 backdrop-blur md:text-[14px] ${panelShadow}`}>
          <div className="border-b border-cream/10 px-5 py-4">
            <p className="text-[12px] text-cream/50">Estimated value · Riverside Café</p>
            <p className="display num mt-1 text-[36px] leading-none text-lime">$227k</p>
          </div>
          <div className="px-5 py-1">
            {rows.map(([k, v, up], i) => (
              <div
                key={k}
                className={`flex justify-between py-2.5 ${i < rows.length - 1 ? "border-b border-cream/10" : ""}`}
              >
                <span>{k}</span>
                <span className={`num ${up ? "text-[#7ee08f]" : "text-cream"}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-cream/10 bg-cream/[0.04] px-5 py-3 text-[12px] text-cream/60">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-lime" fill="none" aria-hidden>
              <path d="M4.5 2.5h5l3 3v8h-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M9.5 2.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            riverside-cafe-valuation.pdf
          </div>
        </div>
      </ArtStage>
    </div>
  );
}

/* ---------------- Engine (Exa "massive scale" pattern) ---------------- */

function Engine() {
  const card =
    "rounded-[6px] border border-ink/10 bg-white/85 p-6 backdrop-blur-sm md:p-7";
  const num = "font-mono text-[48px] leading-none tracking-[-0.03em] text-ink md:text-[56px]";
  const unit = "ml-2 font-mono text-[22px] uppercase tracking-[-0.01em] text-ink md:text-[26px]";
  const desc = "mt-4 max-w-[30ch] text-[15px] leading-[1.55] text-ink/55 md:text-[16px]";
  return (
    <section className="relative overflow-hidden px-4 py-24 md:px-6 md:py-36">
      <ParticleField className="pointer-events-none absolute right-0 top-0 h-[560px] w-full opacity-35 md:h-[720px] md:w-[78%] md:opacity-100" />
      <span className="absolute right-[10%] top-[150px] z-[1] hidden rounded-[4px] bg-[#1d7a3a] px-2.5 py-1.5 text-[12px] font-medium text-cream md:block">
        Sector benchmarks
      </span>
      <span className="absolute left-[45%] top-[430px] z-[1] hidden rounded-[4px] bg-ink px-2.5 py-1.5 text-[12px] font-medium text-cream md:block">
        Your business
      </span>

      <div className="relative z-[2] mx-auto max-w-[1400px]">
        <FadeIn className="max-w-[560px]">
          <h2 className="display text-[38px] text-ink md:text-[52px] lg:text-[60px]">
            Built on how businesses are really valued
          </h2>
          <p className="mt-6 text-[16px] leading-[1.65] text-ink/60 md:text-[17px]">
            Capstack places your business against benchmarks for its sector, then adjusts for what
            makes it different. The AI only gathers your story; the maths is fixed, documented and
            explainable.
          </p>
          <div className="mt-8">
            <DemoLauncher size="lg">Explore Demo</DemoLauncher>
          </div>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 gap-4 md:mt-36 md:grid-cols-3">
          <FadeIn className={`${card} md:min-h-[300px]`}>
            <p>
              <span className={num}>14</span>
              <span className={unit}>sectors</span>
            </p>
            <p className={desc}>Industry benchmark sets, from software to hospitality</p>
          </FadeIn>
          <FadeIn delay={80} className={`${card} md:mt-32 md:min-h-[240px]`}>
            <p>
              <span className={num}>21</span>
              <span className={unit}>data points</span>
            </p>
            <p className={desc}>Gathered about your business in one plain-English conversation</p>
          </FadeIn>
          <FadeIn delay={160} className={`${card} md:row-span-2 md:mt-64`}>
            <p>
              <span className={num}>7</span>
              <span className={unit}>signals</span>
            </p>
            <p className={desc}>Growth, track record, margin and debt checks that adjust your multiple</p>
          </FadeIn>
          <FadeIn delay={120} className={`${card} md:col-span-2`}>
            <p className={num}>70 / 30</p>
            <p className={desc}>Earnings and revenue views blended in every estimate</p>
            <div className="my-7 border-t border-ink/10" />
            <p className={num}>&plusmn;15%</p>
            <p className={desc}>Range around the midpoint, so you see the spread and not just one number</p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */

type Plan = {
  name: string;
  blurb: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
  cta: "demo" | "waitlist";
};

const PLANS: Plan[] = [
  {
    name: "Free",
    blurb: "A basic valuation to understand what your business is worth today.",
    price: "$0",
    period: "per valuation",
    features: ["Basic valuation calculator", "Basic valuation report"],
    cta: "demo",
  },
  {
    name: "Premium",
    blurb: "For owners and brokers who need a full valuation now and then.",
    price: "$49",
    period: "per valuation",
    features: [
      "AI-powered valuation",
      "In-depth valuation report",
      "Report customisation",
      "Report personalisation",
    ],
    cta: "waitlist",
  },
  {
    name: "Premium Subscription",
    blurb: "For brokers and firms valuing businesses throughout the year.",
    price: "$299",
    period: "per month",
    features: [
      "15 valuation reports a month",
      "AI-powered valuation and enhancements",
      "In-depth valuation reports",
      "Full customisation and personalisation",
    ],
    featured: true,
    cta: "waitlist",
  },
];

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 ${className}`} fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-28 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead
          align="center"
          title="Simple pricing"
          sub="Start free today. Paid plans are launching soon, and the waitlist gets first access."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 md:mt-20 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const dark = p.featured;
            return (
              <FadeIn key={p.name} delay={i * 80} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-[8px] p-7 md:p-9 ${
                    dark
                      ? "grain bg-[#0d1d13] text-cream shadow-[0_40px_80px_-40px_rgba(12,29,18,0.6)]"
                      : "border border-ink/10 bg-white/70 backdrop-blur-sm"
                  }`}
                >
                  <div className="relative z-[2] flex h-full flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className={`text-[19px] font-medium ${dark ? "text-cream" : "text-ink"}`}>{p.name}</h3>
                      {p.cta === "waitlist" ? (
                        <span className={`text-[14px] ${dark ? "text-lime/80" : "text-ink/45"}`}>Coming soon</span>
                      ) : null}
                    </div>
                    <p className={`mt-3 max-w-[34ch] text-[15px] leading-[1.55] ${dark ? "text-cream/60" : "text-ink/55"}`}>
                      {p.blurb}
                    </p>
                    <p className="mt-8 flex items-baseline gap-2">
                      <span className={`display num text-[56px] leading-none md:text-[64px] ${dark ? "text-cream" : "text-ink"}`}>
                        {p.price}
                      </span>
                      <span className={`text-[15px] ${dark ? "text-cream/55" : "text-ink/50"}`}>{p.period}</span>
                    </p>

                    <div className="mt-8">
                      {p.cta === "demo" ? (
                        <DemoLauncher variant="ghost" size="lg" className="w-full justify-center">
                          Try it free
                        </DemoLauncher>
                      ) : (
                        <a
                          href="#waitlist"
                          className={`flex w-full justify-center rounded-[8px] px-5 py-3 text-[15px] font-medium transition-colors ${
                            dark ? "bg-lime text-green hover:bg-lime-soft" : "bg-green text-lime hover:bg-green-mid"
                          }`}
                        >
                          Join the waitlist
                        </a>
                      )}
                    </div>

                    <ul className={`mt-8 flex flex-col gap-3.5 border-t pt-8 ${dark ? "border-cream/10" : "border-ink/10"}`}>
                      {p.features.map((f) => (
                        <li key={f} className={`flex items-start gap-3 text-[15px] ${dark ? "text-cream/85" : "text-ink/75"}`}>
                          <Check className={`mt-0.5 ${dark ? "text-lime" : "text-[#2a9d4f]"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Audiences ---------------- */

function Audiences() {
  const cols = [
    {
      who: "For business owners",
      title: "Know your number before you negotiate",
      body: "Walk into any conversation with a buyer, bank or partner knowing what your business is worth, and why.",
      Visual: OwnerVisual,
      bg: "linear-gradient(160deg, #f3e8d3 0%, #e7ecd6 60%, #cfe3cf 100%)",
    },
    {
      who: "For investors",
      title: "Compare businesses on the same terms",
      body: "Every valuation uses the same benchmarks and adjustments, so opportunities line up side by side.",
      Visual: InvestorVisual,
      bg: "linear-gradient(160deg, #dfeee2 0%, #c9e3cf 55%, #9fcfaa 100%)",
    },
    {
      who: "For brokers",
      title: "Price listings with confidence",
      body: "Set realistic asking prices quickly and hand buyers a clear, professional report to back them up.",
      Visual: BrokerVisual,
      bg: "linear-gradient(160deg, #e5efd3 0%, #c8e0b4 55%, #8fc58f 100%)",
    },
  ];
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead
          title="Built for everyone at the table"
          sub="A clear, defensible number changes the conversation, whether you're selling, investing or brokering the deal."
        />
        <div className="mt-14 grid grid-cols-1 border-t border-ink/10 md:mt-20 md:grid-cols-3 md:gap-x-16 lg:gap-x-20">
          {cols.map((c, i) => (
            <FadeIn
              key={c.who}
              delay={i * 80}
              className="relative flex h-full flex-col border-b border-ink/10 py-10 md:border-b-0 md:py-12 [&>p:nth-of-type(2)]:md:mb-10"
            >
              {i > 0 ? (
                <span aria-hidden className="absolute inset-y-0 -left-8 hidden border-l border-ink/10 md:block lg:-left-10" />
              ) : null}
              <p className="text-[15px] text-ink/50">{c.who}</p>
              <h3 className="display mt-4 max-w-[16ch] text-[30px] text-ink md:text-[34px]">{c.title}</h3>
              <p className="mt-4 max-w-[38ch] text-[16px] leading-[1.6] text-ink/55">{c.body}</p>
              <div
                className="grain relative mt-10 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[4px] p-6 md:mt-auto"
                style={{ background: c.bg }}
              >
                <div className="relative z-[2] w-full max-w-[320px]">
                  <c.Visual />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const miniCard = "rounded-[6px] bg-white p-5 shadow-[0_20px_50px_-24px_rgba(12,29,18,0.45)]";

function OwnerVisual() {
  return (
    <div className={miniCard}>
      <p className="text-[13px] text-ink/50">Riverside Café · your valuation</p>
      <p className="display num mt-1 text-[40px] leading-none text-ink">$227k</p>
      <div className="relative mt-5 h-1.5 rounded-full bg-ink/[0.07]">
        <div className="absolute inset-y-0 left-[15%] right-[15%] rounded-full bg-[#34c759]" />
        <div className="absolute -top-1 left-1/2 h-3.5 w-[3px] -translate-x-1/2 rounded-full bg-green" />
      </div>
      <div className="num mt-2 flex justify-between text-[12px] text-ink/50">
        <span>$193k</span>
        <span>$262k</span>
      </div>
    </div>
  );
}

function InvestorVisual() {
  const rows = [
    { name: "Northside Dental", m: 3.9 },
    { name: "Riverside Café", m: 2.9 },
    { name: "Brightline Freight", m: 2.5 },
  ];
  return (
    <div className={miniCard}>
      <p className="text-[13px] text-ink/50">Adjusted earnings multiple</p>
      <div className="mt-4 flex flex-col gap-3.5">
        {rows.map((r, i) => (
          <div key={r.name}>
            <div className="flex justify-between text-[13px]">
              <span className="text-ink/80">{r.name}</span>
              <span className="num font-medium text-ink">{r.m.toFixed(1)}×</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-ink/[0.07]">
              <div
                className="h-full rounded-full"
                style={{ width: `${(r.m / 4.6) * 100}%`, background: i === 0 ? "#2a9d4f" : "#9ccf9f" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrokerVisual() {
  const rows: [string, string][] = [
    ["Suggested asking price", "$262k"],
    ["Expected sale value", "$227k"],
    ["Walk-away floor", "$193k"],
  ];
  return (
    <div className={miniCard}>
      <p className="text-[13px] text-ink/50">Listing guidance · Riverside Café</p>
      <div className="mt-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-ink/[0.07] py-2.5 text-[14px]">
            <span className="text-ink/70">{k}</span>
            <span className="num font-medium text-ink">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] text-[#1d7a3a]">
        <Check />
        Buyer-ready report attached
      </div>
    </div>
  );
}

/* ---------------- Footer (Exa closing-statement pattern) ---------------- */

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#product" },
      { label: "How it works", href: "#method" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Join the waitlist", href: "#waitlist" },
      { label: "Contact", href: "mailto:hello@capstak.com" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Twitter", href: "#" },
    ],
  },
];

function Footer() {
  return (
    <footer
      id="contact"
      className="grain mt-10 overflow-hidden text-cream"
      style={{
        background: [
          "radial-gradient(60% 80% at 85% 0%, rgba(200,224,67,0.16), transparent 60%)",
          "radial-gradient(50% 70% at 0% 100%, rgba(52,199,89,0.18), transparent 60%)",
          "linear-gradient(180deg, #1d5a33 0%, #123d22 100%)",
        ].join(", "),
      }}
    >
      <div className="relative z-[2] mx-auto max-w-[1400px] px-6 pb-16 pt-28 md:px-8 md:pb-20 md:pt-40">
        <p className="text-[16px] text-cream/75 md:text-[18px]">Capstak</p>
        <h2 className="display mt-6 max-w-[18ch] text-[44px] text-cream md:text-[76px] lg:text-[88px]">
          Imagine knowing exactly what your business is worth
        </h2>
        <p className="mt-6 max-w-[34rem] text-[16px] leading-[1.6] text-cream/65 md:text-[18px]">
          Be the first to know when Capstak goes live. Join the waitlist for early access.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <WaitlistForm id="waitlist" className="max-w-[460px] scroll-mt-40" />
          <DemoLauncher variant="lime" size="lg" className="justify-center">
            Explore Demo
          </DemoLauncher>
        </div>
      </div>

      <div className="relative z-[2] border-t border-cream/15">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-8 gap-y-12 px-6 py-14 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,2fr)] md:px-8 md:py-16">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="display mb-2 text-[22px] text-cream md:text-[24px]">{col.title}</p>
              {col.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[15px] text-cream/70 transition-colors hover:text-lime"
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
          <div className="col-span-2 flex items-start md:col-span-1 md:justify-end">
            <Logo tone="white" size={40} />
          </div>
        </div>
        <div className="mx-auto flex max-w-[1400px] gap-8 px-6 pb-10 text-[14px] text-cream/45 md:px-8">
          <a href="#" className="hover:text-cream/80">Privacy</a>
          <a href="#" className="hover:text-cream/80">Terms</a>
          <span className="ml-auto">© {new Date().getFullYear()} Capstak</span>
        </div>
      </div>
    </footer>
  );
}
