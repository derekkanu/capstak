import { SECTORS, type SectorKey } from "../quickEstimate";
import { naira } from "./format";

/* Every chapter's questions, one at a time, in the owner's words. Each has a plain "What do you mean?"
   explanation, and some get a one-line reaction from Sarah once answered. The finance meaning stays underneath:
   the engine reads the answers, the owner never sees the jargon. */

export type Choice = { value: string; label: string; hint?: string };

export type Question = {
  id: string;
  prompt: string;
  /** "What do you mean?" */
  help: string;
  kind: "text" | "choice" | "multi" | "money" | "number" | "months" | "upload";
  options?: Choice[];
  picks?: string[]; // quick picks under a text field
  placeholder?: string;
  optional?: boolean;
  /** for money questions: a one-tap answer of ₦0 ("No, we don't keep any") */
  none?: string;
  /** Sarah's one-line reaction to the answer, shown as the next question arrives */
  react?: (answer: unknown) => string | null;
};

export const BASICS: Question[] = [
  {
    id: "businessName",
    prompt: "What's your business called?",
    help: "The name customers know it by. It goes on your report.",
    kind: "text",
    placeholder: "Mama Nkechi's Kitchen",
    react: (a) => (a ? `${a}. Good name.` : null),
  },
  {
    id: "sector",
    prompt: "What does it do?",
    help: "Pick the closest. Each trade sells for a different amount, so this sets where we start.",
    kind: "choice",
    options: SECTORS.map((s) => ({ value: s.key, label: s.label })),
  },
  {
    id: "city",
    prompt: "Where is it?",
    help: "The town or city it trades in. Buyers pay differently in different places.",
    kind: "text",
    placeholder: "Enugu",
    picks: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu"],
  },
  {
    id: "years",
    prompt: "How long has it been open?",
    help: "A longer track record makes your earnings easier for a buyer to believe.",
    kind: "choice",
    options: [
      { value: "lt1", label: "Under a year" },
      { value: "1-2", label: "1 to 2 years" },
      { value: "2-5", label: "2 to 5 years" },
      { value: "5-10", label: "5 to 10 years" },
      { value: "10+", label: "Over 10 years" },
    ],
    react: (a) => (a === "5-10" || a === "10+" ? "That's a solid track record. Buyers like that." : null),
  },
  {
    id: "people",
    prompt: "How many people work in it, including you?",
    help: "Everyone who works there regularly, full or part time.",
    kind: "number",
    placeholder: "9",
  },
  {
    id: "salesBand",
    prompt: "Roughly what comes in, in a normal month?",
    help: "All the money customers pay you in a month, before any costs. A rough idea is fine; we'll get exact in chapter 02.",
    kind: "choice",
    options: [
      { value: "lt500k", label: "Under ₦500k" },
      { value: "500k-2m", label: "₦500k to ₦2M" },
      { value: "2m-5m", label: "₦2M to ₦5M" },
      { value: "5m-20m", label: "₦5M to ₦20M" },
      { value: "gt20m", label: "Over ₦20M" },
    ],
  },
];

export const NUMBERS: Question[] = [
  {
    id: "months",
    prompt: "Roughly what came in each of the last six months?",
    help: "Sales: all the money customers paid you that month, before any costs. Rough guesses are fine. If you don't know a month, put what a normal month looks like.",
    kind: "months",
  },
  {
    id: "lastMonthCosts",
    prompt: "And what went out last month?",
    help: "Everything you spent to run the business: stock, rent, staff, fuel, the generator, data. Don't count what you paid yourself; we work that out separately.",
    kind: "money",
    placeholder: "1,150,000",
  },
  {
    id: "fixedCosts",
    prompt: "Of that, how much stays the same even in a slow month?",
    help: "Costs you pay whatever happens: rent, salaries, subscriptions. The rest (stock, ingredients, fuel) goes up and down with sales.",
    kind: "money",
    placeholder: "400,000",
  },
  {
    id: "lastYearSales",
    prompt: "About how much came in during all of last year?",
    help: "A rough total is fine. It tells us whether you're growing faster than prices, and lets us use a second way of valuing you. Skip it if you really don't know.",
    kind: "money",
    optional: true,
    placeholder: "14,000,000",
  },
  {
    id: "equipment",
    prompt: "If you sold your equipment and fittings today, what would they fetch?",
    help: "Machines, freezers, vehicles, furniture, the generator: what someone would pay for them second-hand, not what you paid.",
    kind: "money",
    placeholder: "2,500,000",
  },
  {
    id: "stock",
    // worded for the trade picked in chapter 01 (see forBusiness): a service business has no shelves
    prompt: "What's the stock on your shelves worth?",
    help: "Goods or materials waiting to be sold or used, at what you paid for them.",
    kind: "money",
    placeholder: "1,100,000",
    none: "We don't keep any stock",
  },
  {
    id: "cash",
    prompt: "How much is in the business account right now?",
    help: "Cash at hand and in the bank that belongs to the business. It's added to what you'd keep after a sale.",
    kind: "money",
    placeholder: "300,000",
  },
  {
    id: "owed",
    prompt: "Does the business owe anyone money?",
    help: "Loans, money owed to suppliers, equipment on credit. Put 0 if not. It comes off what you'd keep, not off what the business is worth.",
    kind: "money",
    placeholder: "0",
    none: "No, we don't owe anything",
    react: (a) => (a === 0 ? "No debts. That's a clean file." : null),
  },
  {
    id: "records",
    prompt: "How do customers mostly pay you?",
    help: "Money that goes through a bank leaves a record a buyer can check, which makes your earnings worth more to them.",
    kind: "choice",
    options: [
      { value: "cash", label: "Mostly cash" },
      { value: "some", label: "A mix of cash and transfer" },
      { value: "bank", label: "Mostly transfer, POS or card" },
    ],
  },
  {
    id: "upload",
    prompt: "Got bank statements or POS slips? Add them now.",
    help: "They back up the sales you just told us about, which makes us surer of your value. Photos are fine. Only you can see them until you choose to share. You can skip this and add them later.",
    kind: "upload",
    optional: true,
  },
];

export const MODEL: Question[] = [
  {
    id: "bigCustomer",
    prompt: "If your biggest customer stopped buying tomorrow, how much would you lose?",
    help: "A buyer worries when one customer is a big part of your sales: lose them and the business shrinks overnight.",
    kind: "choice",
    options: [
      { value: "little", label: "Very little", hint: "No one customer matters that much" },
      { value: "quarter", label: "About a quarter" },
      { value: "half", label: "Half or more" },
    ],
  },
  {
    id: "repeat",
    prompt: "Do the same customers come back?",
    help: "Customers who come back every week or month are the sales a buyer can count on.",
    kind: "choice",
    options: [
      { value: "most", label: "Most come back regularly" },
      { value: "some", label: "Some do" },
      { value: "new", label: "Mostly new each time" },
    ],
    react: (a) => (a === "most" ? "That's worth a lot. Repeat customers are the steadiest sales there are." : null),
  },
  {
    id: "supplier",
    prompt: "If your main supplier stopped selling to you, would you be in trouble?",
    help: "If one supplier can stop your business, a buyer counts that as a risk.",
    kind: "choice",
    options: [
      { value: "fine", label: "No, I have others" },
      { value: "while", label: "For a little while" },
      { value: "badly", label: "Yes, badly" },
    ],
  },
  {
    id: "withoutYou",
    prompt: "Could the business run for a month without you?",
    help: "If it stops when you stop, a buyer is buying a job, not a business. This is one of the biggest things that moves your value.",
    kind: "choice",
    options: [
      { value: "yes", label: "Yes, it would be fine" },
      { value: "partly", label: "Partly, with some calls" },
      { value: "no", label: "No, it needs me" },
    ],
  },
  {
    id: "edge",
    prompt: "Why do customers buy from you and not the shop next door?",
    help: "In your own words. It goes into your report as the story of your business.",
    kind: "text",
    placeholder: "Our jollof, and we deliver to offices on time",
  },
  {
    id: "channels",
    prompt: "How do people find you and pay you?",
    help: "Pick all that apply. More ways in means sales don't hang on one channel.",
    kind: "multi",
    options: [
      { value: "walk-in", label: "They walk in" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "instagram", label: "Instagram or TikTok" },
      { value: "referrals", label: "Word of mouth" },
      { value: "contracts", label: "Contracts or orders" },
      { value: "online", label: "A website or app" },
    ],
  },
  {
    id: "streams",
    prompt: "How many different ways does money come in?",
    help: "For example a restaurant might sell meals, cater events and sell drinks: three ways.",
    kind: "choice",
    options: [
      { value: "one", label: "One main way" },
      { value: "few", label: "Two or three" },
      { value: "many", label: "More than three" },
    ],
  },
  {
    id: "mustHave",
    prompt: "What could the business not run without?",
    help: "The one thing that, if it went, would stop you. A buyer wants to know it comes with the business.",
    kind: "choice",
    options: [
      { value: "location", label: "Its location" },
      { value: "equipment", label: "Its equipment" },
      { value: "licence", label: "A licence or permit" },
      { value: "person", label: "One key person" },
      { value: "nothing", label: "Nothing in particular" },
    ],
  },
  {
    id: "premises",
    prompt: "Do you own or rent where the business runs?",
    help: "A long lease or owned premises means the business, and its customers, can stay where they are.",
    kind: "choice",
    options: [
      { value: "own", label: "We own it" },
      { value: "long", label: "Rent, with 2+ years left" },
      { value: "short", label: "Rent, with less than 2 years" },
      { value: "none", label: "No fixed place" },
    ],
  },
];

/* What "stock" means in each trade. Trades that don't usually hold stock are asked about supplies instead, and can
   answer "none" in one tap. */
const STOCK: Record<SectorKey, { prompt: string; help: string; none: string }> = {
  food: {
    prompt: "What are the ingredients and drinks you have in worth?",
    help: "Food, drinks, packaging: what you've bought and not yet used or sold, at what you paid for it.",
    none: "We don't keep any",
  },
  trade: {
    prompt: "What are the goods on your shelves worth?",
    help: "Everything waiting to be sold, in the shop and the store room, at what you paid for it.",
    none: "We don't keep any stock",
  },
  beauty: {
    prompt: "What are the products and fabric you have in worth?",
    help: "Products for sale or use on customers, fabric and materials, at what you paid for them.",
    none: "We don't keep any",
  },
  services: {
    prompt: "Do you keep any supplies or materials?",
    help: "Things you buy to do the work and haven't used yet: parts, materials, consumables. Most service businesses keep little or none.",
    none: "No, we don't keep any",
  },
  health: {
    prompt: "What are the medicines and supplies you have in worth?",
    help: "Everything waiting to be sold or used, at what you paid for it. Leave out anything expired.",
    none: "We don't keep any stock",
  },
  education: {
    prompt: "Do you keep any books, uniforms or supplies for sale?",
    help: "Things you sell to pupils or parents and haven't sold yet, at what you paid for them.",
    none: "No, we don't keep any",
  },
  construction: {
    prompt: "What are the building materials you have on hand worth?",
    help: "Cement, rods, tiles, timber: anything bought and not yet used on a job, at what you paid for it.",
    none: "We don't keep any",
  },
  logistics: {
    prompt: "Do you keep any spare parts, tyres or fuel in stock?",
    help: "Things bought for the vehicles and not yet used, at what you paid for them.",
    none: "No, we don't keep any",
  },
  making: {
    prompt: "What are your materials and finished goods worth?",
    help: "Raw materials, work in progress and finished goods not yet sold, at what they cost you.",
    none: "We don't keep any",
  },
  tech: {
    prompt: "Do you keep any devices or hardware for sale?",
    help: "Hardware or devices you've bought to sell or install and haven't yet. Most software businesses keep none.",
    none: "No, we don't keep any",
  },
};

/** a question as this owner should see it: some are worded for their trade */
export function forBusiness(q: Question, basics: { sector: SectorKey } | null): Question {
  if (q.id === "stock" && basics) return { ...q, ...STOCK[basics.sector] };
  return q;
}

export const CHAPTERS = {
  basics: { no: "01", title: "About your business", questions: BASICS },
  numbers: { no: "02", title: "Your sales and costs", questions: NUMBERS },
  model: { no: "03", title: "How you make money", questions: MODEL },
} as const;

export type ChapterKey = keyof typeof CHAPTERS;

/** readable answer, for review lists */
export function showAnswer(q: Question, a: unknown): string {
  if (a === undefined || a === null || a === "") return "Skipped";
  if (q.kind === "money") return naira(Number(a));
  if (q.kind === "months") return (a as number[]).map(naira).join(" · ");
  if (q.kind === "choice") return q.options?.find((o) => o.value === a)?.label ?? String(a);
  if (q.kind === "multi") return (a as string[]).map((v) => q.options?.find((o) => o.value === v)?.label ?? v).join(", ");
  return String(a);
}
