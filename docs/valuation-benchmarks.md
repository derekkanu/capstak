# Valuation benchmarks

Every figure the valuation uses, where it comes from, and how much to trust it. Checked 28 Nov 2026.
The code reads these from `app/lib/quickEstimate.ts` (trade multiples), `app/lib/capstack/engine.ts`
(the return a buyer wants, the method weights) and `app/lib/capstack/suggest.ts` (the estimates offered to
owners). Change them there; keep this page in step.

**Confidence:** **Sourced** = set from a published benchmark. **Reasoned** = worked out from how the trade's
costs usually split, not yet checked against data. Nothing here is calibrated on Nigerian sale prices yet: there
is no public series of Nigerian small-business sales. That calibration comes from brokers' closed deals.

## 1. What buyers pay: years of earnings by trade

Small businesses sell on seller's discretionary earnings (what's left for the owner before paying themselves).
In the US the average is about 2.6–2.7× ([BizBuySell 2025 review](https://bizbuysell.com/blog/2025-year-in-review/),
[Q3 2026 report](https://finviz.com/news/404656/bizbuysell-releases-q3-2026-insight-report)). We take them about
20% lower for Nigeria's extra risk (naira bonds ~16.5% against ~4% in the US, currency, power, fewer buyers).

| Trade | Our multiple | Reference | Confidence |
|---|---|---|---|
| Food & drinks | 1.9 | Restaurants 2.41 (Q2 2026 record) ([Fast Casual](https://www.fastcasual.com/articles/restaurant-resales-fall-in-2026-turnkey-franchise-deals-surge/)) | Sourced |
| Services | 2.1 | Service businesses 2.52 ([BizBuySell](https://bizbuysell.com/blog/2025-year-in-review/)) | Sourced |
| Fashion & beauty | 1.8 | Beauty & personal care 2.14 ([BizBuySell](https://bizbuysell.com/learning-center/industry-valuation-multiples)) | Sourced |
| Shop & trading | 2.0 | Retail ~2.6–2.7 (2025) | Sourced |
| Health & pharmacy | 2.6 | Healthcare trades higher than average | Reasoned |
| Schools & training | 2.5 | Recurring fees, sticky customers | Reasoned |
| Building & construction | 2.0 | Project-based, lumpy | Reasoned |
| Transport & logistics | 2.0 | Asset-heavy, thin margins | Reasoned |
| Making things | 2.4 | Wholesale/distribution 2.89 nearby | Reasoned |
| Tech & software | 2.8 | Software sells above average | Reasoned |

Each business's multiple then moves with its answers (size, track record, growth, records, how much it depends on
the owner, customers, suppliers, premises): see the reasons in `engine.ts`. Kept between 1.0 and 4.5.

**Size:** 79% of Nigeria's informal businesses make under ₦250k profit a month
([BusinessDay, Moniepoint data](https://businessday.ng/companies/article/79-of-businesses-make-less-than-n250000-profit-monthly-report/)),
so "small earnings" (under ₦500k a month left) takes 0.2 off.

## 2. The return a buyer wants (income method)

Built the way valuers do in a local currency:

| Part | Value | Source |
|---|---|---|
| Naira government bond yield | 16.5% | FGN bonds ~16.5–17.3% (Oct–Nov 2026) ([Guardian](https://guardian.ng/?p=2956477), [AllAfrica](https://allafrica.com/stories/202611120179.html)) |
| less Nigeria's default spread | −5.52% | [Damodaran, Jan 2026](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html) (B3) |
| plus Nigeria's equity risk premium | +12.64% | [Damodaran, Jan 2026](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html) (4.23% mature + 8.41% country) |
| plus small private business premium | +12% | Reasoned: hard to sell, depends on few people; typical build-up range 10–15% |
| plus specific risk from the answers | 0–10% | 2% per thing pulling the value down |
| **Total** | **~36–46%** | Buyers get their money back in roughly 2–4 years |

Growth is a cautious 10% a year in naira, below inflation, so no real growth is assumed. Earnings are taken after
paying a manager (10% of sales, ₦150k–₦1.5M a month), because a buyer has to replace the owner. Capped at the same
share of sales as the comparison method. Method from [SCORE](https://www.score.org/articles/how-to-value-a-small-business/).

## 3. Estimates offered to owners

Shown under questions in chapter 02, so owners don't need an accountant. An answer that is exactly our estimate
counts as rough: it doesn't raise "how sure we are" like the owner's own figure.

| Trade | Kept (of each ₦1 of sales) | Fixed (share of costs) | Stock held | Confidence |
|---|---|---|---|---|
| Food & drinks | 15% | 45% | ~1 week | Sourced: food 28–35%, labour 25–33%, rent 5–10% of revenue; net 3–9% after paying a manager ([ChowNow](https://get.chownow.com/blog/restaurant-industry-benchmarks/), [Toast](https://pos.toasttab.com/blog/on-the-line/average-restaurant-profit-margin)) |
| Shop & trading | 10% | 15% | ~1 month | Sourced: grocery gross margin ~27% ([Statistics Canada](https://ised-isde.canada.ca/app/ixb/cis/performance/4451)) |
| Health & pharmacy | 12% | 15% | ~5 weeks | Sourced: gross ~22%, pre-tax net 5–6% ([Drug Channels](https://www.drugchannels.net/2021/02/pharmacy-economics-rebound-little-amid.html?hl=en&m=0), [BizBuySell](https://www.bizbuysell.com/learning-center/revenue-profit-benchmarks/pharmacies)); ~37 days of stock ([PBA Health](https://www.pbahealth.com/elements/metrics-to-measure-pharmacy-success/)) |
| Fashion & beauty | 30% | 45% | ~1 month | Reasoned |
| Services | 35% | 65% | none | Reasoned |
| Schools & training | 30% | 70% | none | Reasoned |
| Building & construction | 20% | 30% | ~2 weeks | Reasoned |
| Transport & logistics | 15% | 40% | none | Reasoned |
| Making things | 25% | 35% | ~1 month | Reasoned |
| Tech & software | 40% | 75% | none | Reasoned |

"Kept" is before the owner pays themselves, so it sits above published net margins (which come after a manager's
pay).

## What would make these better

1. **Closed deals from Nigerian brokers**: the only way to calibrate the multiples to what buyers here actually pay.
2. **Stears Valuation Benchmarks** for African private companies by revenue band
   ([paywalled](https://stears-business-prod-bzozxh67t-stears-team.vercel.app/premium/article/stears-valuation-benchmarks-2024-african-private-markets-by-revenue-band)).
3. **Moniepoint / SMEDAN data by sector** for Nigerian margins, to replace the reasoned rows above.
4. **Capstack's own files**: once owners add bank statements, their real margins and fixed shares can tune section 3.
