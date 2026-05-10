import FadeIn from "./components/FadeIn";

export default function Home() {
  return (
    <main className="flex flex-col text-ink">
      <Header />
      <Hero />
      <Pricing />
      <About />
      <WhyMatters />
      <StandardBanner />
      <CTASection />
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
  const aspect = 1078 / 356;
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo-capstack.png"
        alt="Capstack"
        draggable={false}
        style={{
          height: `${size}px`,
          width: `${size * aspect}px`,
          filter: tone === "white" ? "brightness(0) invert(1)" : undefined,
        }}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="entrance-nav w-full px-6 pt-5">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between rounded-[20px] bg-white px-7 py-3 md:px-9 md:py-4">
        <a href="#" aria-label="Capstack home" className="flex items-center">
          <Logo size={54} />
        </a>
        <nav className="hidden items-center gap-10 text-[14px] text-ink/85 md:flex">
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#about" className="transition-colors hover:text-ink">
            About
          </a>
          <a href="#contact" className="transition-colors hover:text-ink">
            Contact
          </a>
          <a
            href="#waitlist"
            className="rounded-[10px] bg-green px-5 py-2.5 text-[14px] font-medium text-lime transition-transform hover:scale-[1.02]"
          >
            Join the waitlist
          </a>
        </nav>
        <a
          href="#waitlist"
          className="rounded-[10px] bg-green px-4 py-2 text-[13px] font-medium text-lime md:hidden"
        >
          Join
        </a>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="px-6 pb-5 pt-5">
      <div
        className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 md:h-[calc(100svh-130px)] md:min-h-[520px] md:grid-cols-2"
      >
        <div className="entrance-card-text h-full">
          <div className="relative flex h-full min-h-[460px] flex-col justify-center rounded-[24px] bg-white px-8 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-[600px]">
              <h1 className="entrance-heading font-normal leading-[1.28] tracking-[-0.02em] text-ink text-[30px] sm:text-[36px] md:text-[42px] lg:text-[48px] xl:text-[54px]">
                Effortless
                <br />
                <span className="whitespace-nowrap">
                  Business{" "}
                  <span className="serif-italic highlight-mark">Valuations,</span>
                </span>
                <br />
                Accurate Results.
              </h1>
              <p className="entrance-body mt-5 max-w-[28rem] text-[14px] leading-[1.5] text-ink/70 md:text-[15px]">
                Unlock your business&rsquo;s true value with ease and
                confidence. Get started with a free, streamlined valuation
                today.
              </p>
              <form
                id="waitlist"
                className="entrance-form mt-9 flex w-full max-w-[420px] items-stretch rounded-[14px] bg-cream-soft p-1.5"
              >
                <input
                  type="email"
                  placeholder="Enter your email..."
                  aria-label="Email address"
                  className="flex-1 bg-transparent px-4 py-3 text-[14px] text-ink placeholder:text-[#9c9c9c] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-[10px] bg-cream px-5 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-cream-deep"
                >
                  Get Notified
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="entrance-card-image h-full">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-full min-h-[460px] overflow-hidden rounded-[24px] bg-green">
      <img
        src="/hero-visual.png"
        alt="Capstack folder with DrinkSanCo valuation report"
        className="absolute inset-0 block h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}

/* ---------------- Pricing ---------------- */

type Feature = { text: string; icon: PillIconName };

function Pricing() {
  return (
    <section id="how" className="px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1400px] rounded-[28px] bg-[#fbfaf2] px-5 pb-8 pt-8 md:rounded-[32px] md:px-10 md:pb-10 md:pt-10">
        <FadeIn className="flex flex-col items-center text-center">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green text-[12px] font-semibold text-lime">
            2
          </span>
          <h2 className="mt-4 text-[22px] leading-tight tracking-[-0.01em] md:text-[26px] lg:text-[30px]">
            Coming Soon:{" "}
            <span className="serif-italic">Advanced Valuation Packages</span>
          </h2>
          <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-ink/55 md:text-[13px]">
            We&rsquo;re hard at work building a comprehensive valuation system
            that will empower you with detailed insights. Stay tuned for our
            tailored plans designed to meet all your business needs.
          </p>
        </FadeIn>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FadeIn delay={80} className="h-full">
            <PricingCard
              index="1"
              title="Premium Subscription"
              description="Ideal for brokers and businesses conducting multiple valuations throughout the year. Gain continuous access to all premium features, including unlimited valuations, AI enhancements, and full personalization"
              price="$299"
              period="per month"
              features={[
                { text: "AI powered valuation", icon: "ai" },
                { text: "In depth valuation report", icon: "doc" },
                { text: "Report customization", icon: "edit" },
                { text: "Report personalization", icon: "personalize" },
                { text: "15 valuation reports a month", icon: "chart" },
              ]}
              tall
              highlightLast
            />
          </FadeIn>

          <div className="flex flex-col gap-4">
            <FadeIn delay={140} className="h-full">
              <PricingCard
                index="2"
                title="Premium Plan:"
                description="Ideal for brokers conducting multiple valuations throughout the year. Gain access to all premium features."
                price="$49"
                period="per valuation"
                features={[
                  { text: "AI powered valuation", icon: "ai" },
                  { text: "In depth valuation report", icon: "doc" },
                  { text: "Report customization", icon: "edit" },
                  { text: "Report personalization", icon: "settings" },
                ]}
              />
            </FadeIn>
            <FadeIn delay={200} className="h-full">
              <PricingCard
                index="3"
                title="Free Plan:"
                description="Get started with a basic valuation to understand your business's worth. Perfect for initial assessments."
                price="$0"
                period="per valuation"
                features={[
                  { text: "Basic valuation calculator", icon: "calc" },
                  { text: "Basic valuation report", icon: "list" },
                ]}
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  index,
  title,
  description,
  price,
  period,
  features,
  tall = false,
  highlightLast = false,
}: {
  index: string;
  title: string;
  description: string;
  price: string;
  period: string;
  features: Feature[];
  tall?: boolean;
  highlightLast?: boolean;
}) {
  const tallOffsets = ["-90px", "130px", "-95px", "140px", "0px"];
  const gradients: Record<string, string> = {
    "1": [
      "radial-gradient(60% 45% at 82% 18%, rgba(120, 200, 130, 0.32), transparent 65%)",
      "radial-gradient(55% 40% at 22% 78%, rgba(225, 235, 140, 0.32), transparent 65%)",
      "radial-gradient(140% 100% at 50% 50%, #f7f6ee 0%, #f1f3e6 100%)",
    ].join(", "),
    "2": [
      "radial-gradient(50% 38% at 18% 22%, rgba(225, 235, 140, 0.36), transparent 65%)",
      "radial-gradient(60% 45% at 82% 80%, rgba(120, 200, 130, 0.26), transparent 65%)",
      "radial-gradient(140% 100% at 50% 50%, #f7f6ef 0%, #f3f4e8 100%)",
    ].join(", "),
    "3": [
      "radial-gradient(55% 40% at 30% 18%, rgba(225, 235, 140, 0.3), transparent 65%)",
      "radial-gradient(50% 45% at 78% 55%, rgba(130, 205, 140, 0.3), transparent 65%)",
      "radial-gradient(140% 100% at 50% 50%, #f7f6ee 0%, #f0f2e5 100%)",
    ].join(", "),
  };
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[20px] p-6 md:rounded-[24px] md:p-7"
      style={{
        background: gradients[index] ?? gradients["1"],
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 min-w-7 items-center justify-center rounded-md bg-lime px-1.5 text-[11px] font-medium text-green">
          {index}
        </span>
        <span className="text-[14px] font-medium text-ink">{title}</span>
      </div>
      <div className="mt-4 max-w-[340px] border-l-[3px] border-green/55 pl-4 text-[12.5px] leading-[1.55] text-ink/70">
        {description}
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-[36px] font-medium tracking-tight text-ink md:text-[40px]">
          {price}
        </span>
        <span className="serif-italic text-[13.5px] text-ink/55">{period}</span>
      </div>
      {tall ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-end gap-5 pb-[41px]">
          {features.map((f, i) => {
            const isLast = i === features.length - 1;
            return (
              <div
                key={f.text}
                style={{
                  transform: `translateX(${tallOffsets[i] ?? "0px"}) translateY(${isLast ? "0px" : "-20px"})`,
                }}
              >
                <FeaturePill
                  text={f.text}
                  icon={f.icon}
                  highlight={highlightLast && i === features.length - 1}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {features.map((f, i) => (
            <div key={f.text} className={i % 2 === 1 ? "ml-auto" : ""}>
              <FeaturePill text={f.text} icon={f.icon} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturePill({
  text,
  icon,
  highlight = false,
}: {
  text: string;
  icon: PillIconName;
  highlight?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12.5px] ${
        highlight
          ? "bg-lime font-medium text-green"
          : "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      }`}
    >
      <PillIcon name={icon} />
      {text}
      {highlight && (
        <span className="absolute -right-2.5 -top-2.5">
          <ScallopSticker />
        </span>
      )}
    </span>
  );
}

function ScallopSticker() {
  const points = 12;
  const r1 = 8;
  const r2 = 11;
  const path = Array.from({ length: points * 2 }, (_, i) => {
    const angle = (i / (points * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? r1 : r2;
    const x = 12 + Math.cos(angle) * r;
    const y = 12 + Math.sin(angle) * r;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d={`${path} Z`} fill="var(--green)" />
      <path
        d="M12 8.5 L12.9 10.6 L15.2 10.8 L13.4 12.2 L14 14.4 L12 13.2 L10 14.4 L10.6 12.2 L8.8 10.8 L11.1 10.6 Z"
        fill="var(--lime)"
      />
    </svg>
  );
}

type PillIconName =
  | "ai"
  | "doc"
  | "edit"
  | "personalize"
  | "settings"
  | "chart"
  | "calc"
  | "list";

function PillIcon({ name }: { name: PillIconName }) {
  const paths: Record<PillIconName, React.ReactNode> = {
    ai: (
      <>
        {/* antenna */}
        <line x1="8" y1="1.5" x2="8" y2="3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="1.5" r="0.7" fill="currentColor" />
        {/* head */}
        <rect x="3" y="3.5" width="10" height="9" rx="2.4" fill="currentColor" />
        {/* eyes */}
        <circle cx="6" cy="7.5" r="0.95" fill="#fff" />
        <circle cx="10" cy="7.5" r="0.95" fill="#fff" />
        {/* mouth */}
        <rect x="6" y="9.8" width="4" height="0.9" rx="0.45" fill="#fff" />
        {/* feet */}
        <rect x="4" y="13" width="2" height="1.4" rx="0.4" fill="currentColor" />
        <rect x="10" y="13" width="2" height="1.4" rx="0.4" fill="currentColor" />
      </>
    ),
    doc: (
      <>
        <path
          d="M4 2h6.5L13 4.4V12l-1.2-0.8-1.2 0.8-1.2-0.8-1.2 0.8-1.2-0.8L5 12V3a1 1 0 0 1 1-1h-2z"
          fill="currentColor"
        />
        <rect x="6" y="5" width="5" height="0.9" rx="0.4" fill="#fff" />
        <rect x="6" y="7" width="5" height="0.9" rx="0.4" fill="#fff" />
        <rect x="6" y="9" width="3.5" height="0.9" rx="0.4" fill="#fff" />
      </>
    ),
    edit: (
      <>
        <path
          d="M5 1.5h4.5l2 2v9.4l-1-0.7-1 0.7-1-0.7-1 0.7-1-0.7-1 0.7V2.5a1 1 0 0 1 1-1z"
          fill="currentColor"
        />
        <rect x="6" y="4.5" width="4.5" height="0.9" rx="0.4" fill="#fff" />
        <rect x="6" y="6.5" width="4.5" height="0.9" rx="0.4" fill="#fff" />
        <circle cx="11.6" cy="3.4" r="1.4" fill="currentColor" />
        <path d="M11.6 2.6v1.6M10.8 3.4h1.6" stroke="#fff" strokeWidth="0.5" strokeLinecap="round" />
      </>
    ),
    personalize: (
      <>
        <path
          d="M5 2h4.5l2 2v9.4l-1-0.7-1 0.7-1-0.7-1 0.7-1-0.7-1 0.7V3a1 1 0 0 1 1-1z"
          fill="currentColor"
        />
        <rect x="6" y="5" width="4" height="0.9" rx="0.4" fill="#fff" />
        <rect x="6" y="7" width="4" height="0.9" rx="0.4" fill="#fff" />
        <circle cx="11.8" cy="3.2" r="1.6" fill="currentColor" />
        <path d="M11.8 2.3v1.8M10.9 3.2h1.8" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" />
      </>
    ),
    settings: (
      <>
        <circle cx="8" cy="8" r="2.2" fill="currentColor" />
        <path
          d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </>
    ),
    chart: (
      <>
        <rect x="2" y="3" width="12" height="10" rx="2" fill="currentColor" />
        <rect x="4" y="9.5" width="1.6" height="2.3" rx="0.3" fill="#fff" />
        <rect x="6.6" y="7.5" width="1.6" height="4.3" rx="0.3" fill="#fff" />
        <rect x="9.2" y="5.5" width="1.6" height="6.3" rx="0.3" fill="#fff" />
        <path
          d="M3.8 8.2 L6.4 6.5 L9 5 L11.6 3.5"
          stroke="var(--lime)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M11.5 3 l1 0 l0 1" stroke="var(--lime)" strokeWidth="1" strokeLinecap="round" fill="none" />
      </>
    ),
    calc: (
      <>
        <rect x="3" y="2" width="10" height="12" rx="1.6" fill="currentColor" />
        <rect x="4.5" y="3.5" width="7" height="2.3" rx="0.5" fill="#fff" />
        <circle cx="6" cy="8.5" r="0.6" fill="#fff" />
        <circle cx="8" cy="8.5" r="0.6" fill="#fff" />
        <circle cx="10" cy="8.5" r="0.6" fill="#fff" />
        <circle cx="6" cy="11" r="0.6" fill="#fff" />
        <circle cx="8" cy="11" r="0.6" fill="#fff" />
        <circle cx="10" cy="11" r="0.6" fill="#fff" />
      </>
    ),
    list: (
      <>
        <rect x="2.5" y="3.5" width="2" height="2" rx="0.4" fill="currentColor" />
        <rect x="2.5" y="7" width="2" height="2" rx="0.4" fill="currentColor" />
        <rect x="2.5" y="10.5" width="2" height="2" rx="0.4" fill="currentColor" />
        <rect x="5.6" y="4" width="8" height="1" rx="0.4" fill="currentColor" />
        <rect x="5.6" y="7.5" width="8" height="1" rx="0.4" fill="currentColor" />
        <rect x="5.6" y="11" width="8" height="1" rx="0.4" fill="currentColor" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 shrink-0"
      aria-hidden
      style={{ color: "var(--green)" }}
    >
      {paths[name]}
    </svg>
  );
}

/* ---------------- About ---------------- */

function About() {
  return (
    <section
      id="about"
      className="px-4 py-6 md:px-6 md:py-8"
    >
      <FadeIn className="mx-auto max-w-[1400px]">
        <img
          src="/about-visual.png"
          alt="About Capstak — our mission to make business valuation simple, transparent, and accessible"
          className="block h-auto w-full rounded-[28px] md:rounded-[32px]"
          draggable={false}
        />
      </FadeIn>
    </section>
  );
}

/* ---------------- Why Matters ---------------- */

function WhyMatters() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-[34px] leading-tight tracking-tight text-green md:text-[40px]">
            Why <span className="serif-italic">Business Valuation</span> Matters
            <br />
            for Every Stakeholder.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FadeIn delay={80}>
            <StakeholderCard
              gradient="linear-gradient(180deg, #f6e4cc 0%, #f4d8b6 100%)"
              title="Empowering Business Owners:"
              body="Accurate valuations ensure business owners achieve optimal outcomes and maximise their growth potential."
              chart={<DonutChart />}
            />
          </FadeIn>
          <FadeIn delay={140}>
            <StakeholderCard
              gradient="linear-gradient(180deg, #efc5d0 0%, #f6d2b6 100%)"
              title="Unlocking Investor Potential:"
              body="Valuation empowers investors to identify sustainable, high-potential businesses, enabling more informed and confident investment decisions."
              chart={<LineChart />}
            />
          </FadeIn>
          <FadeIn delay={200}>
            <StakeholderCard
              gradient="linear-gradient(180deg, #b6e6d2 0%, #d6e6c0 100%)"
              title="Enhancing Broker Success:"
              body="Accurate valuations enable brokers to match the right buyers with the right businesses, driving success for all parties."
              chart={<BarChart />}
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function StakeholderCard({
  gradient,
  title,
  body,
  chart,
}: {
  gradient: string;
  title: string;
  body: string;
  chart: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full min-h-[520px] flex-col justify-between rounded-[24px] p-8 shadow-[0_2px_18px_rgba(0,0,0,0.04)]"
      style={{ background: gradient }}
    >
      <div>
        <h3 className="max-w-[14ch] text-[22px] font-medium leading-snug text-ink">
          {title}
        </h3>
        <p className="mt-5 max-w-[28ch] text-[13.5px] leading-[1.55] text-ink/65">
          {body}
        </p>
      </div>
      <div className="mt-8 flex items-end justify-center">{chart}</div>
    </div>
  );
}

function DonutChart() {
  const r = 64;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 180 180" className="h-44 w-44" aria-hidden>
      {/* outer halo ring */}
      <circle cx="90" cy="90" r={r} fill="none" stroke="#cdebd3" strokeWidth="22" />
      {/* solid green ring */}
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="#5fbf75"
        strokeWidth="14"
        strokeDasharray={`${c} ${c}`}
      />
      {/* center text */}
      <text
        x="90"
        y="92"
        textAnchor="middle"
        fontSize="22"
        fontWeight="600"
        fill="#1a2a1f"
      >
        100%
      </text>
      <text x="90" y="108" textAnchor="middle" fontSize="8.5" fill="#1a2a1f">
        Accurate
      </text>
      <text x="90" y="119" textAnchor="middle" fontSize="8.5" fill="#1a2a1f">
        valuation report.
      </text>
    </svg>
  );
}

function LineChart() {
  const ticks = [
    { y: 30, label: "24" },
    { y: 55, label: "16" },
    { y: 80, label: "12" },
    { y: 105, label: "8" },
    { y: 130, label: "4" },
    { y: 155, label: "0" },
  ];
  return (
    <div
      className="w-full max-w-[260px] rotate-[2deg] rounded-[14px] bg-[#e7f1de] p-3 shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
      style={{
        background: "linear-gradient(180deg, #e8f1de 0%, #d8ead0 100%)",
      }}
    >
      <svg viewBox="0 0 260 190" className="h-auto w-full" aria-hidden>
        <text x="10" y="18" fontSize="9" fill="#1a2a1f">
          Months
        </text>
        {ticks.map((t) => (
          <g key={t.label}>
            <text
              x="22"
              y={t.y + 3}
              textAnchor="end"
              fontSize="9"
              fill="#1a2a1f"
            >
              {t.label}
            </text>
            <line
              x1="28"
              x2="250"
              y1={t.y}
              y2={t.y}
              stroke="#1a2a1f"
              strokeOpacity="0.55"
              strokeWidth="0.6"
            />
          </g>
        ))}
        {/* green declining line */}
        <polyline
          points="32,40 70,70 105,110 140,135 180,150 220,154 248,155"
          fill="none"
          stroke="#3aa055"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* pinkish variable line */}
        <polyline
          points="32,150 70,135 105,118 140,100 175,118 210,140 248,150"
          fill="none"
          stroke="#e29ba6"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* axis baseline */}
        <line x1="28" y1="155" x2="250" y2="155" stroke="#1a2a1f" strokeWidth="0.8" />
        {/* x labels */}
        <text x="55" y="172" fontSize="7.5" fill="#1a2a1f">
          Unsold
        </text>
        <text x="55" y="181" fontSize="7.5" fill="#1a2a1f">
          Businesses
        </text>
        <text x="200" y="172" fontSize="7.5" fill="#1a2a1f">
          Sold
        </text>
        <text x="200" y="181" fontSize="7.5" fill="#1a2a1f">
          Businesses
        </text>
      </svg>
    </div>
  );
}

function BarChart() {
  return (
    <svg viewBox="0 0 240 200" className="h-48 w-full max-w-[240px]" aria-hidden>
      {/* left bar background */}
      <rect x="50" y="30" width="50" height="140" rx="4" fill="#dcdcd6" />
      {/* left bar fill (70%) */}
      <rect x="50" y="72" width="50" height="98" rx="4" fill="#7cc28a" />
      {/* right bar background */}
      <rect x="140" y="30" width="50" height="140" rx="4" fill="#dcdcd6" />
      {/* right bar fill (20%) */}
      <rect x="140" y="142" width="50" height="28" rx="4" fill="#f6dfc4" />
      {/* labels inside bars */}
      <text
        x="75"
        y="90"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#1a2a1f"
      >
        70%
      </text>
      <text
        x="165"
        y="160"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#1a2a1f"
      >
        20%
      </text>
      {/* baseline */}
      <line x1="30" y1="175" x2="210" y2="175" stroke="#1a2a1f" strokeWidth="1" />
      {/* x labels */}
      <text x="75" y="190" textAnchor="middle" fontSize="9" fill="#1a2a1f">
        Buy Existing
      </text>
      <text x="165" y="190" textAnchor="middle" fontSize="9" fill="#1a2a1f">
        Start New
      </text>
    </svg>
  );
}

/* ---------------- Standard Banner ---------------- */

function StandardBanner() {
  return (
    <section className="px-4 py-6 md:px-6 md:py-8">
      <div
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] px-6 py-24 text-center md:rounded-[32px] md:px-10 md:py-36 lg:py-40"
        style={{
          background: [
            "radial-gradient(70% 95% at 18% 50%, rgba(190, 235, 130, 0.22), transparent 60%)",
            "radial-gradient(55% 90% at 90% 55%, rgba(190, 235, 130, 0.14), transparent 60%)",
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.32) 0.45%, rgba(0,0,0,0) 1.6%, rgba(255,255,255,0.07) 4.16%, rgba(0,0,0,0) 6.7%, rgba(0,0,0,0.32) 7.88%, rgba(0,0,0,0.32) 8.33%)",
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.28) 100%)",
            "linear-gradient(180deg, #1d4528 0%, #0c2516 100%)",
          ].join(", "),
        }}
      >
        <FadeIn>
          <p className="mx-auto max-w-2xl text-[18px] leading-[1.55] text-lime md:text-[20px]">
            Setting the standard for business valuation. With Capstak, we make
            the valuation process easy and accessible, whether you&rsquo;re a
            first-time user or a seasoned professional.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */

function CTASection() {
  return (
    <section id="contact" className="px-4 pb-16 md:px-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 md:grid-cols-2">
        <FadeIn className="h-full">
          <div className="relative h-full min-h-[600px] overflow-hidden rounded-[28px] md:rounded-[32px]">
            <CkLogoArt />
          </div>
        </FadeIn>

        <FadeIn delay={120} className="h-full">
          <div
            className="relative flex h-full min-h-[600px] flex-col items-center overflow-hidden rounded-[28px] px-8 py-14 text-center md:rounded-[32px] md:px-12"
            style={{
              background: [
                "radial-gradient(55% 70% at 95% 45%, rgba(120, 200, 130, 0.42), transparent 65%)",
                "radial-gradient(80% 60% at 0% 0%, rgba(255, 255, 255, 0.55), transparent 60%)",
                "linear-gradient(180deg, #efeede 0%, #e6e7d0 100%)",
              ].join(", "),
            }}
          >
            <div className="relative mt-2">
              <span
                aria-hidden
                className="absolute -inset-2 rounded-full bg-lime/45 blur-[3px]"
              />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green text-lime">
                <ContactCardIcon />
              </span>
            </div>
            <h2 className="mt-12 max-w-md text-[24px] font-medium leading-tight tracking-tight text-ink md:text-[26px]">
              Join the Future of Business Valuation.
            </h2>
            <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink/65">
              Be the first to know when we go live. Sign up now to receive
              updates and stay ahead with accurate, easy valuations.
            </p>
            <form className="mt-10 flex w-full max-w-md items-stretch rounded-[14px] bg-cream-soft p-1.5">
              <input
                type="email"
                placeholder="Enter your email..."
                aria-label="Email address"
                className="flex-1 bg-transparent px-4 py-3 text-[14px] text-ink placeholder:text-[#9c9c9c] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-[10px] bg-cream px-5 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-cream-deep"
              >
                Get Notified
              </button>
            </form>
            <div className="mt-10 flex items-center gap-3">
              <SocialIcon label="LinkedIn" />
              <SocialIcon label="Instagram" />
              <SocialIcon label="Twitter" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function ContactCardIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="currentColor" />
      <circle cx="6" cy="7" r="1.4" fill="var(--green)" />
      <rect x="9" y="6.2" width="3.2" height="0.8" rx="0.4" fill="var(--green)" />
      <rect x="9" y="7.8" width="3.2" height="0.8" rx="0.4" fill="var(--green)" />
      <rect x="4" y="9.5" width="4" height="0.8" rx="0.4" fill="var(--green)" />
    </svg>
  );
}

function CkLogoArt() {
  return (
    <img
      src="/cta-curtain.png"
      alt="Capstak Ck logomark on a cream curtain backdrop"
      className="absolute inset-0 block h-full w-full object-cover object-center"
      draggable={false}
    />
  );
}

function SocialIcon({ label }: { label: string }) {
  const icons: Record<string, React.ReactNode> = {
    LinkedIn: (
      <path d="M4.98 3.5c0 1.38-1.11 2.5-2.49 2.5S0 4.88 0 3.5C0 2.13 1.12 1 2.49 1c1.38 0 2.49 1.13 2.49 2.5zM.18 8h4.6v14H.18V8zM7.65 8h4.42v1.92h.06c.62-1.17 2.13-2.4 4.39-2.4 4.7 0 5.56 3.09 5.56 7.11V22h-4.6v-6.36c0-1.52-.03-3.47-2.11-3.47-2.11 0-2.43 1.65-2.43 3.36V22h-4.59V8z" />
    ),
    Instagram: (
      <>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.81.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.81-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.81-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.81.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.91.33 4.15.63a5.86 5.86 0 0 0-2.13 1.39A5.86 5.86 0 0 0 .63 4.15c-.3.76-.5 1.63-.56 2.9C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.14.56 2.9.31.79.73 1.46 1.39 2.13.67.66 1.34 1.08 2.13 1.39.76.3 1.63.5 2.9.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.14-.26 2.9-.56a5.86 5.86 0 0 0 2.13-1.39 5.86 5.86 0 0 0 1.39-2.13c.3-.76.5-1.63.56-2.9.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.14-.56-2.9a5.86 5.86 0 0 0-1.39-2.13A5.86 5.86 0 0 0 19.85.63c-.76-.3-1.63-.5-2.9-.56C15.67.01 15.26 0 12 0z" />
        <path d="M12 5.84A6.16 6.16 0 0 0 5.84 12 6.16 6.16 0 0 0 12 18.16 6.16 6.16 0 0 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
        <circle cx="18.41" cy="5.59" r="1.44" />
      </>
    ),
    Twitter: (
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05A4.28 4.28 0 0 0 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06A12.06 12.06 0 0 0 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
    ),
  };
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md bg-green text-lime transition-colors hover:bg-green-mid"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        {icons[label]}
      </svg>
    </a>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer
      className="relative overflow-hidden px-6 py-16 text-white"
      style={{
        background:
          "linear-gradient(180deg, #0e2a18 0%, #061308 100%)",
      }}
    >
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <Logo tone="white" />
        </div>
        <div className="flex flex-col gap-3 text-[14px]">
          <span className="mb-1 text-white/55">Links</span>
          <a className="hover:text-lime" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-lime" href="#">
            Terms of Service
          </a>
          <a className="hover:text-lime" href="#">
            Socials
          </a>
        </div>
        <div className="flex flex-col gap-3 text-[14px]">
          <span className="mb-1 text-white/55">Contact Info:</span>
          <a className="hover:text-lime" href="mailto:hello@capstak.com">
            Support email
          </a>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-0 right-0 select-none text-center font-semibold leading-none tracking-tight text-white/[0.04]"
        style={{ fontSize: "min(28vw, 320px)" }}
      >
        Capstack
      </div>
    </footer>
  );
}
