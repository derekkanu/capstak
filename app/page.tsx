import FadeIn from "./components/FadeIn";
import WaitlistForm from "./components/WaitlistForm";
import DemoLauncher from "./components/DemoLauncher";
import ValuationPlayground from "./components/ValuationPlayground";
import ValuationMethod from "./components/ValuationMethod";
import HeroDeck from "./components/HeroDeck";
import FileTabs from "./components/FileTabs";
import Shelf from "./components/Shelf";
import { Arrow, Folder, Seal, Stop } from "./components/FilePieces";

/* Capstack landing page, "On file" direction (docs/brand/on-file, docs/capstack-spec.html).
   Example business across the page: Okafor Woodworks, a furniture workshop, ₦24M–₦35M (illustrative). */

export default function Home() {
  return (
    <main className="flex flex-col text-ink">
      <Header />
      <Hero />
      <Estimate />
      <HowItWorks />
      <InYourFile />
      <FadeIn amount={0.08}>
        <ValuationMethod />
      </FadeIn>
      <BothSides />
      <Pricing />
      <Footer />
    </main>
  );
}

/* ---------------- Header ---------------- */

function Logo({ tone = "ink", size = 28 }: { tone?: "ink" | "white"; size?: number }) {
  const src = tone === "white" ? "/logo-capstack-cream.png" : "/logo-capstack.png";
  const aspect = tone === "white" ? 1694 / 516 : 1078 / 356;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Capstack" draggable={false} style={{ height: `${size}px`, width: `${size * aspect}px` }} />
  );
}

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#file", label: "Your file" },
  { href: "#brokers", label: "For brokers" },
  { href: "#pricing", label: "Pricing" },
];

function Header() {
  return (
    <div className="entrance-nav sticky top-0 z-40 w-full">
      <a href="#waitlist" className="group block bg-green px-4 py-2 text-center text-[13px] text-cream/80 transition-colors hover:text-cream">
        <span className="hidden sm:inline">Capstack is opening early access for business owners and brokers.</span>
        <span className="sm:hidden">Early access is opening.</span>
        <span className="tab-label ml-2 text-lime">( Get notified )</span>
      </a>
      <header className="border-b border-ink/[0.07] bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[72px] md:px-10">
          <a href="#" aria-label="Capstack home" className="flex items-center">
            <Logo size={44} />
          </a>
          <nav className="hidden items-center gap-9 text-[15px] text-ink/70 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="#waitlist" className="btn btn-s btn-md hidden md:inline-flex">
              Join the waitlist
            </a>
            <DemoLauncher size="md" className="hidden md:inline-flex">
              <Arrow className="h-2.5 w-2.5 text-lime" />
              Try it free
            </DemoLauncher>
            <DemoLauncher size="sm" className="md:hidden">
              Try it free
            </DemoLauncher>
          </div>
        </div>
      </header>
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return <HeroDeck />;
}

/* ---------------- Shared section heading ---------------- */

function SectionHead({
  title,
  sub,
  align = "left",
  tone = "ink",
}: {
  label?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "cream";
}) {
  const dark = tone === "cream";
  return (
    <FadeIn className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      <h2 className={`display max-w-[20ch] text-[40px] md:text-[56px] ${dark ? "text-cream" : "text-green"}`}>
        {title}
        <Stop />
      </h2>
      {sub ? (
        <p className={`max-w-[40rem] text-[16px] leading-[1.6] md:text-[18px] ${dark ? "text-cream/65" : "text-ink/60"}`}>{sub}</p>
      ) : null}
    </FadeIn>
  );
}

/* ---------------- Quick estimate (the free tier) ---------------- */

function Estimate() {
  return (
    <section id="estimate" className="scroll-mt-28 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1320px]">
        <SectionHead
          align="center"
          label="Free · quick estimate"
          title={<>Try a rough number <em>right now</em></>}
          sub="Seven plain answers, the same way small businesses are priced when they change hands: what's left for you each year, times what buyers pay in your trade."
        />
        <FadeIn className="mt-12 md:mt-16">
          <ValuationPlayground />
        </FadeIn>
        <p className="mx-auto mt-6 max-w-[60ch] text-center text-[13px] leading-[1.6] text-ink/45">
          Multiples start from small-business sale data, adjusted down for Nigeria&rsquo;s higher risk, and will be sharpened
          with real sale prices from our broker partners. Debts aren&rsquo;t included. A quick estimate is a guide, not a formal valuation.
        </p>
      </div>
    </section>
  );
}

/* ---------------- How it works: a shelf of folders ---------------- */

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-28 px-5 py-20 md:px-10 md:py-28">
      <FadeIn className="mx-auto max-w-[1320px]">
        <Shelf
          head={
            <SectionHead
              title={<>Four steps to your number</>}
              sub="About twenty minutes in all, spread over as many sittings as you like. Rough numbers are welcome."
            />
          }
        />
      </FadeIn>
    </section>
  );
}

/* ---------------- What goes in your file ---------------- */

function InYourFile() {
  return (
    <section id="file" className="stack-field scroll-mt-28 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1320px]">
        <SectionHead
          label="Your file"
          title={<>Five tabs. <em>Everything a buyer asks about</em></>}
          sub="Your dashboard is your business's file. Each tab is a short set of everyday questions, and each one leaves you with something useful, even before the valuation."
        />
        <FadeIn className="mt-12 md:mt-16">
          <FileTabs />
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- Both sides of the table ---------------- */

function BothSides() {
  const cols = [
    {
      who: "For owners",
      title: <>Know your number <em>before</em> you negotiate</>,
      body: "Walk into a conversation with a buyer, a bank or a partner knowing what your business is worth, and why.",
    },
    {
      id: "brokers",
      who: "For brokers",
      title: <>Price listings with <em>proof</em></>,
      body: "Value every client the same way, hand buyers a report they can read, and keep all your files in one place. Partner pricing for early brokers.",
    },
    {
      who: "For investors",
      title: <>Compare businesses <em>on the same terms</em></>,
      body: "Every valuation uses the same benchmarks and the same checks, so opportunities line up side by side.",
    },
  ];
  return (
    <section className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead
            label="The deal table"
            title={<>The number <em>both sides</em> can trust</>}
            sub="The seller hopes for one number. The buyer offers another. Capstack brings the receipts."
          />
          <div className="flex flex-col border-t border-ink/10">
            {cols.map((c, i) => (
              <FadeIn key={c.who} delay={i * 70} className="scroll-mt-32 border-b border-ink/10 py-6">
                <div id={c.id} className="grid gap-2 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8">
                  <span className="tab-label pt-2 text-ink/50">( {c.who} )</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="display text-[26px] text-green md:text-[30px]">{c.title}</h3>
                    <p className="max-w-[46ch] text-[15px] leading-[1.6] text-ink/60 md:text-[16px]">{c.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* the deal: two numbers, and the stamped one */}
        <FadeIn className="relative mx-auto w-full max-w-[520px]">
          <div className="grid grid-rows-2 overflow-hidden rounded-[8px] shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
            <div className="flex aspect-[2.1/1] flex-col gap-2 bg-peach p-7">
              <span className="tab-label text-ink/50">The seller hopes</span>
              <span className="num font-mono text-[44px] font-medium tracking-[-0.04em] text-green">₦45M</span>
            </div>
            <div className="flex aspect-[2.1/1] flex-col justify-end gap-2 bg-green p-7 text-cream">
              <span className="tab-label text-sage-soft">The buyer offers</span>
              <span className="num font-mono text-[44px] font-medium tracking-[-0.04em]">₦22M</span>
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-lime p-5 text-green shadow-[0_18px_36px_-16px_rgba(0,0,0,0.55)]">
            <span className="tab-label">Capstack · with every reason</span>
            <p className="num mt-2 font-mono text-[34px] font-medium tracking-[-0.04em]">₦24M – ₦35M</p>
            <p className="mt-1 text-[14px]">Okafor Woodworks · File №0142</p>
            <Seal id="deal" className="absolute -right-6 -top-8 h-[76px] w-[76px] rotate-[-12deg] text-green" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */

type Plan = {
  tab: string;
  name: string;
  who: string;
  price: string;
  period: string;
  features: string[];
  cta: "demo" | "waitlist";
  dark?: boolean;
  fill: string;
  tabFill: string; // the tab carries the plan's colour, like coloured folder tabs in a cabinet
};

const PLANS: Plan[] = [
  {
    tab: "Free",
    name: "Quick estimate",
    who: "For anyone curious about their number.",
    price: "₦0",
    period: "always free",
    features: ["The quick estimate calculator", "A rough range for your trade, with every step shown", "No sign-up needed"],
    cta: "demo",
    fill: "#fbfaf6",
    tabFill: "#93b99b",
  },
  {
    tab: "Owners",
    name: "Full valuation",
    who: "For owners valuing their own business, once or now and then.",
    price: "At launch",
    period: "priced per valuation, in Naira",
    features: ["The guided conversation", "Your business model, on one page", "Range, confidence score and every reason", "A report to share with a buyer or bank"],
    cta: "waitlist",
    fill: "#c9dccb",
    tabFill: "#d4ed6f",
  },
  {
    tab: "Brokers",
    name: "Broker desk",
    who: "For brokers and advisers valuing many businesses a year.",
    price: "At launch",
    period: "monthly, with partner pricing",
    features: ["Every client's file in one place", "Reports with your own brand", "Compare businesses side by side", "Early-partner discount"],
    cta: "waitlist",
    dark: true,
    fill: "#042e1b",
    tabFill: "#ff6a1a",
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
    <section id="pricing" className="scroll-mt-28 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1320px]">
        <SectionHead
          label="Pricing"
          title={<>Start free. <em>Pay when it matters</em></>}
          sub="The quick estimate is free today. Full valuations and the broker desk open with early access, priced in Naira. The waitlist hears first."
        />
        <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 md:mt-20 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <FadeIn key={p.name} delay={i * 80} className="relative pt-9">
              {/* the plan is a folder: the tab names who it's for */}
              <div className="absolute inset-0">
                <Folder w={420} h={560} tx={0.06} tw={0.34} th={36} fill={p.fill} stroke={p.dark ? undefined : "#1d2a22"} />
              </div>
              {/* the same folder again in the tab's colour, cut to the tab's height, so only the tab is coloured */}
              <div className="absolute inset-0 [clip-path:inset(0_0_93.6%_0)]">
                <Folder w={420} h={560} tx={0.06} tw={0.34} th={36} fill={p.tabFill} stroke={p.dark ? undefined : "#1d2a22"} />
              </div>
              <span className="tab-label absolute left-[23%] top-[3.5%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold text-green">{p.tab}</span>
              <div className={`relative flex h-full flex-col px-7 pb-8 pt-8 md:px-9 ${p.dark ? "text-cream" : "text-ink"}`}>
                <h3 className={`text-[20px] font-semibold ${p.dark ? "text-cream" : "text-green"}`}>{p.name}</h3>
                <p className={`mt-2 max-w-[32ch] text-[15px] leading-[1.55] ${p.dark ? "text-cream/65" : "text-ink/60"}`}>{p.who}</p>
                <p className="mt-8 flex flex-col gap-1">
                  <span className={`display num text-[48px] md:text-[56px] ${p.dark ? "text-cream" : "text-green"}`}>{p.price}</span>
                  <span className={`text-[14px] ${p.dark ? "text-cream/55" : "text-ink/50"}`}>{p.period}</span>
                </p>
                <div className="mt-8">
                  {p.cta === "demo" ? (
                    // the quick estimate is live: this goes straight to it
                    <a href="#estimate" className="btn btn-s btn-lg w-full">
                      Try the quick estimate
                    </a>
                  ) : (
                    <a href="#waitlist" className={`btn btn-lg w-full ${p.dark ? "btn-lime" : "btn-p"}`}>
                      Join the waitlist
                    </a>
                  )}
                </div>
                <ul className={`mt-8 flex flex-col gap-3.5 border-t pt-7 ${p.dark ? "border-cream/15" : "border-ink/10"}`}>
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-[15px] ${p.dark ? "text-cream/85" : "text-ink/75"}`}>
                      <Check className={`mt-0.5 ${p.dark ? "text-lime" : "text-green"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Quick estimate", href: "#estimate" },
      { label: "How it works", href: "#how" },
      { label: "Your file", href: "#file" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "For brokers", href: "#brokers" },
      { label: "Join the waitlist", href: "#waitlist" },
      { label: "Contact", href: "mailto:hello@capstak.com" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "X (Twitter)", href: "#" },
    ],
  },
];

function Footer() {
  return (
    <footer id="contact" className="stack-field-dark mt-10 overflow-hidden text-cream">
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-10 md:pb-20 md:pt-36">
        <h2 className="display max-w-[16ch] text-[46px] text-cream md:text-[80px]">
          Know what your business is <em>worth</em>
          <Stop />
        </h2>
        <p className="mt-6 max-w-[34rem] text-[16px] leading-[1.6] text-cream/65 md:text-[18px]">
          Capstack opens to business owners and brokers soon. Join the waitlist and you&rsquo;ll be first in.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <WaitlistForm id="waitlist" className="max-w-[460px] scroll-mt-40" />
          <DemoLauncher variant="lime" size="lg">
            Try it free
          </DemoLauncher>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-8 gap-y-12 px-5 py-14 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,2fr)] md:px-10 md:py-16">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="tab-label mb-2 text-sage-soft">( {col.title} )</p>
              {col.links.map((l) => (
                <a key={l.label} href={l.href} className="text-[15px] text-cream/75 transition-colors hover:text-lime">
                  {l.label}
                </a>
              ))}
            </div>
          ))}
          <div className="col-span-2 flex items-start md:col-span-1 md:justify-end">
            <Logo tone="white" size={38} />
          </div>
        </div>
        <div className="mx-auto flex max-w-[1400px] gap-8 px-5 pb-10 text-[14px] text-cream/45 md:px-10">
          <a href="#" className="hover:text-cream/80">Privacy</a>
          <a href="#" className="hover:text-cream/80">Terms</a>
          <span className="ml-auto">© {new Date().getFullYear()} Capstack</span>
        </div>
      </div>
    </footer>
  );
}
