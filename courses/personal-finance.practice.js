/* Steady · Personal Finance & Investing — hands-on "Try it" exercises, one per lesson (keyed by lesson id).
   Calculators use the same formulas as the lessons' worked examples. They are for learning, not personal financial advice. */
window.PRACTICE = window.PRACTICE || {};
(() => {
const pct = x => x * 100;
// Monthly payment that repays `pv` over `n` months at monthly rate `r`
const payment = (pv, r, n) => r ? pv * r / (1 - Math.pow(1 + r, -n)) : pv / n;
// APR equivalent of a flat-rate instalment loan (bisection on the monthly rate)
function flatToApr(P, flat, years) {
  const n = years * 12, pmt = (P + P * flat / 100 * years) / n; let lo = 0, hi = 1;
  if (!(P > 0 && n > 0 && flat > 0)) return 0;
  for (let i = 0; i < 80; i++) { const r = (lo + hi) / 2; (pmt * (1 - Math.pow(1 + r, -n)) / r > P) ? lo = r : hi = r; }
  return lo * 12 * 100;
}
// Card payoff: each month interest is added, then the payment (minimum % of balance, at least the floor, or a fixed amount)
function payoff(balance, apr, minPct, floor, fixed) {
  let b = balance, m = 0, paid = 0; const r = apr / 100 / 12;
  if (fixed && fixed <= b * r) return {months: Infinity, paid: Infinity};
  while (b > 0.005 && m < 1200) { b += b * r; let p = fixed || Math.max(b * minPct / 100, floor); p = Math.min(p, b); b -= p; paid += p; m++; }
  return m >= 1200 ? {months: Infinity, paid: Infinity} : {months: m, paid};
}

window.PRACTICE['personal-finance'] = {
  // ── Unit 1 · Money Foundations
  'cash-flow-net-worth': {type: 'calc', title: 'Your cash flow and net worth', intro: 'Start with Faisal’s numbers from the example, then replace them with your own.',
    inputs: [
      {k: 'inc', label: 'Monthly take-home income', v: 20000, step: 500, min: 0, unit: 'SAR'},
      {k: 'out', label: 'Monthly spending', v: 16000, step: 500, min: 0, unit: 'SAR'},
      {k: 'sav', label: 'Savings and investments', v: 100000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'own', label: 'Car, property and other assets', v: 50000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'debt', label: 'Everything you owe', v: 70000, step: 1000, min: 0, unit: 'SAR'}],
    outputs: [
      {label: 'Monthly cash flow', fmt: 'sar', f: v => v.inc - v.out},
      {label: 'Savings rate', fmt: 'pct', f: v => v.inc ? pct((v.inc - v.out) / v.inc) : NaN},
      {label: 'Net worth', fmt: 'sar', big: true, f: v => v.sav + v.own - v.debt}],
    note: v => v.inc - v.out < 0 ? 'You’re spending more than you earn. The next lesson on budgeting is the place to start.' : v.sav + v.own - v.debt < 0 ? 'A negative net worth is common early on, especially with loans. What matters is that it rises each year.' : 'Track cash flow monthly and net worth once a year. The trend matters more than any single number.'},
  'budgeting': {type: 'calc', title: 'Your 50/30/20 budget', intro: 'Enter your take-home pay and what your essentials cost today.',
    inputs: [
      {k: 'inc', label: 'Monthly take-home income', v: 15000, step: 500, min: 0, unit: 'SAR'},
      {k: 'needs', label: 'What your needs cost now (rent, food, transport, bills)', v: 8000, step: 250, min: 0, unit: 'SAR'}],
    outputs: [
      {label: 'Needs (50%)', fmt: 'sar', f: v => v.inc * 0.5},
      {label: 'Wants (30%)', fmt: 'sar', f: v => v.inc * 0.3},
      {label: 'Savings, transferred on payday (20%)', fmt: 'sar', big: true, f: v => v.inc * 0.2},
      {label: 'Your needs as a share of income', fmt: 'pct', f: v => v.inc ? pct(v.needs / v.inc) : NaN}],
    note: v => v.needs > v.inc * 0.5 ? 'Your needs take more than half your income. That’s common with high rent. Trim wants first and still automate whatever saving you can, even 10%.' : 'Your needs fit within 50%. Set up the 20% as an automatic transfer on payday so saving happens before spending.'},
  'emergency-fund': {type: 'calc', title: 'Your emergency-fund target', intro: 'Add up only the essentials you couldn’t stop paying.',
    inputs: [
      {k: 'home', label: 'Housing', v: 4000, step: 100, min: 0, unit: 'SAR'},
      {k: 'food', label: 'Food', v: 2000, step: 100, min: 0, unit: 'SAR'},
      {k: 'bills', label: 'Utilities and phone', v: 700, step: 50, min: 0, unit: 'SAR'},
      {k: 'trans', label: 'Transport', v: 1300, step: 100, min: 0, unit: 'SAR'},
      {k: 'debt', label: 'Minimum debt payments', v: 1000, step: 100, min: 0, unit: 'SAR'},
      {k: 'save', label: 'You can save each month', v: 2000, step: 100, min: 0, unit: 'SAR'}],
    outputs: [
      {label: 'Essential monthly costs', fmt: 'sar', f: v => v.home + v.food + v.bills + v.trans + v.debt},
      {label: 'First target: 3 months', fmt: 'sar', big: true, f: v => 3 * (v.home + v.food + v.bills + v.trans + v.debt)},
      {label: 'Full target: 6 months', fmt: 'sar', f: v => 6 * (v.home + v.food + v.bills + v.trans + v.debt)},
      {label: 'Time to reach the first target', fmt: 'months', f: v => v.save > 0 ? 3 * (v.home + v.food + v.bills + v.trans + v.debt) / v.save : NaN}],
    note: () => 'Keep it in a separate, easy-to-reach savings account, not invested in shares. Refill it after you use it.'},
  'inflation': {type: 'calc', title: 'How fast prices rose', intro: 'Pick something you remember the price of from a few years ago.',
    inputs: [
      {k: 'then', label: 'Price back then', v: 12, step: 0.5, min: 0.01, unit: 'SAR'},
      {k: 'now', label: 'Price today', v: 15, step: 0.5, min: 0, unit: 'SAR'},
      {k: 'yrs', label: 'Years between', v: 5, step: 1, min: 1}],
    outputs: [
      {label: 'Total increase', fmt: 'pct', f: v => pct(v.now / v.then - 1)},
      {label: 'Average increase per year', fmt: 'pct', big: true, f: v => pct(Math.pow(v.now / v.then, 1 / v.yrs) - 1)},
      {label: 'What SAR 100,000 in cash would buy after 20 years at that rate', fmt: 'sar', f: v => 100000 / Math.pow(v.now / v.then, 20 / v.yrs)}],
    note: () => 'Prices of single items swing more than overall inflation, but the lesson holds: cash kept for decades quietly loses buying power.'},
  'compounding': {type: 'calc', title: 'Watch compounding work', intro: 'The default is the lesson’s example: SAR 100,000 at 7% for 30 years.',
    inputs: [
      {k: 'p', label: 'Starting amount', v: 100000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'r', label: 'Yearly return', v: 7, step: 0.5, min: 0, unit: '%'},
      {k: 'n', label: 'Years', v: 30, step: 1, min: 1}],
    outputs: [
      {label: 'Final value', fmt: 'sar', big: true, f: v => v.p * Math.pow(1 + v.r / 100, v.n)},
      {label: 'Growth from compounding (growth on growth)', fmt: 'sar', f: v => v.p * Math.pow(1 + v.r / 100, v.n) - v.p - v.p * v.r / 100 * v.n},
      {label: 'Rule of 72: years to double', fmt: 'years', f: v => v.r > 0 ? 72 / v.r : NaN},
      {label: 'Exact years to double', fmt: 'years', f: v => v.r > 0 ? Math.log(2) / Math.log(1 + v.r / 100) : NaN}],
    note: v => v.r >= 20 ? 'At rates like a credit card’s (around 27%), debt doubles in under three years. Compounding works against you on debt.' : 'Try 27%, a typical credit-card rate, to see how fast debt compounds.'},

  // ── Unit 2 · Debt & Credit
  'interest-apr': {type: 'calc', title: 'Turn a flat rate into the real APR', intro: 'Instalment loans are often quoted as a flat rate. Enter an offer to see its true yearly cost.',
    inputs: [
      {k: 'p', label: 'Amount borrowed', v: 100000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'flat', label: 'Flat rate per year', v: 5, step: 0.25, min: 0, unit: '%'},
      {k: 'yrs', label: 'Years', v: 5, step: 1, min: 1}],
    outputs: [
      {label: 'Total interest', fmt: 'sar', f: v => v.p * v.flat / 100 * v.yrs},
      {label: 'Monthly payment', fmt: 'sar', f: v => (v.p + v.p * v.flat / 100 * v.yrs) / (v.yrs * 12)},
      {label: 'Total repaid', fmt: 'sar', f: v => v.p + v.p * v.flat / 100 * v.yrs},
      {label: 'Equivalent APR', fmt: 'pct', big: true, f: v => flatToApr(v.p, v.flat, v.yrs)}],
    note: () => 'A flat rate charges interest on the full amount for the whole term, even as you repay it, so the APR is nearly double. Always compare loans by APR and total repaid.'},
  'credit-cards': {type: 'calc', title: 'Minimum payments vs a fixed payment', intro: 'The defaults match the lesson: SAR 10,000 at about 27% a year, with a 5% minimum (at least SAR 100).',
    inputs: [
      {k: 'b', label: 'Card balance', v: 10000, step: 500, min: 0, unit: 'SAR'},
      {k: 'apr', label: 'Yearly rate', v: 27, step: 0.5, min: 0, unit: '%'},
      {k: 'min', label: 'Minimum payment', v: 5, step: 0.5, min: 1, unit: '% of balance'},
      {k: 'fix', label: 'Or a fixed monthly payment of', v: 1000, step: 100, min: 0, unit: 'SAR'}],
    outputs: [
      {label: 'Paying the minimum: months to clear', fmt: 'months', f: v => payoff(v.b, v.apr, v.min, 100).months},
      {label: 'Paying the minimum: total paid', fmt: 'sar', f: v => payoff(v.b, v.apr, v.min, 100).paid},
      {label: 'Fixed payment: months to clear', fmt: 'months', f: v => v.fix > 0 ? payoff(v.b, v.apr, 0, 0, v.fix).months : NaN},
      {label: 'Fixed payment: total paid', fmt: 'sar', big: true, f: v => v.fix > 0 ? payoff(v.b, v.apr, 0, 0, v.fix).paid : NaN}],
    note: v => v.fix > 0 && v.fix <= v.b * v.apr / 1200 ? 'That fixed payment doesn’t even cover the monthly interest, so the balance would never fall.' : 'Best of all: pay the full statement balance every month, and interest never starts.'},
  'credit-record': {type: 'pick', title: 'What builds a good credit record?', intro: 'Select every habit that helps your credit record (with SIMAH in Saudi Arabia, or your country’s bureau).',
    items: [
      ['Paying every instalment and bill on time', true, 'Payment history matters most.'],
      ['Keeping card balances well below the limit', true, 'Low utilisation signals you’re not stretched.'],
      ['Checking your report and disputing errors', true, 'Mistakes happen; you have the right to correct them.'],
      ['Applying for several loans in the same week', false, 'Many applications at once can look like financial stress.'],
      ['Using your full credit limit every month', false, 'High utilisation counts against you, even if you pay.'],
      ['Missing a payment, then paying double next month', false, 'The late payment is still recorded.']]},
  'paying-off-debt': {type: 'order', title: 'Order the debts: avalanche method', intro: 'With the avalanche method, which debt gets your extra money first? Order from first to last.',
    items: ['Credit card · SAR 8,000 at 27%', 'Personal loan · SAR 40,000 at 9% APR', 'Car financing · SAR 30,000 at 6% APR', 'Instalment plan · SAR 3,000 at 0%'],
    why: 'Avalanche pays the highest interest rate first, which saves the most money. Keep paying the minimum on the others. The snowball method would start with the smallest balance (the SAR 3,000 plan) for a quick win instead.'},

  // ── Unit 3 · Protecting Yourself
  'insurance-takaful': {type: 'sort', title: 'Insure it or cover it yourself?', intro: 'Insurance (or takaful) is for rare losses you couldn’t afford. Small, affordable losses are cheaper to cover from savings.',
    buckets: ['Insure it', 'Cover it from savings'],
    items: [
      ['Major hospital treatment', 0, 'Rare but potentially huge costs.'],
      ['A cracked phone screen', 1, 'Affordable; insurance premiums usually cost more over time.'],
      ['The main earner dying while the family has a mortgage', 0, 'Life cover or family takaful protects the family.'],
      ['A small scratch on the car', 1, 'Often below the deductible anyway.'],
      ['Injuring someone in a car accident', 0, 'Liability can be enormous. Third-party motor cover is mandatory in Saudi Arabia.'],
      ['An extended warranty on a SAR 300 kettle', 1, 'Low cost to replace.'],
      ['Losing your income through long-term disability', 0, 'A long income loss can be devastating.']]},
  'scams-fraud': {type: 'pick', title: 'Spot the red flags', intro: 'A message promotes a new investment platform. Which of these are red flags?',
    items: [
      ['“Guaranteed 5% profit every week, no risk”', true, 'Guaranteed high returns with no risk don’t exist.'],
      ['A famous presenter “endorses” it in a social-media ad', true, 'Fake celebrity endorsements are a classic trick.'],
      ['They ask for the one-time code sent to your phone', true, 'Never share OTPs, PINs or passwords with anyone.'],
      ['“This offer ends in 2 hours”', true, 'Pressure is designed to stop you thinking.'],
      ['Your “profits” grow, but withdrawals are “temporarily delayed”', true, 'Typical of a Ponzi scheme near collapse.'],
      ['The firm appears on the Capital Market Authority’s list of licensed firms', false, 'A good sign, but check you’re dealing with the real firm and not an impersonator.']]},

  // ── Unit 4 · Investing Basics
  'saving-vs-investing': {type: 'sort', title: 'Save it or invest it?', intro: 'Money you need within about 3 years belongs in savings. Money for 5 or more years away can be invested.',
    buckets: ['Save (safe and accessible)', 'Invest (long-term growth)'],
    items: [
      ['Your emergency fund', 0, 'Must be available at any time and must not fall in value.'],
      ['A wedding next year', 0, 'Too soon to risk a market fall.'],
      ['Retirement in 25 years', 1, 'Plenty of time to ride out downturns.'],
      ['A house deposit in two years', 0, 'Short-term money stays safe.'],
      ['Your child’s university fees in 15 years', 1, 'A long horizon suits investing.'],
      ['A car in 18 months', 0, 'Short term: keep it in savings.'],
      ['Long-term wealth you won’t touch for over 10 years', 1, 'Growth that beats inflation matters most here.']]},
  'risk-return': {type: 'steps', title: 'Find your real risk tolerance', intro: 'Answer honestly. How you’d react in a crash matters more than how you feel when markets are calm.',
    steps: [
      ['Your investments just fell 30% in one month. What would you actually do?', 'Sell, hold and wait, or buy more? How would it feel?'],
      ['How many years until you need this money?', 'Under 3, 3 to 5, or over 5 years?'],
      ['Given both answers, what share of your long-term money would you put in shares?', 'e.g. “60% shares, 40% sukuk and cash”']],
    sample: 'I’d be worried and tempted to sell, but I wouldn’t need the money for 20 years, so I’d hold. Because a fall bothers me, I’d choose 60% global shares and 40% sukuk rather than 100% shares, which lets me stick with the plan in a crash.',
    checks: ['Your share allocation is one you could hold through a 30% fall', 'Money needed within 3 years isn’t in shares', 'You wrote down what you’ll do in a crash, in advance']},
  'asset-classes': {type: 'sort', title: 'Name the asset class', intro: 'Sort each holding into its asset class.',
    buckets: ['Cash', 'Sukuk and bonds', 'Shares', 'Real estate'],
    items: [
      ['A savings account', 0, 'Cash: stable, low return.'],
      ['A money-market fund', 0, 'Cash-like and very low risk.'],
      ['Saudi government sukuk', 1, 'Sharia-compliant fixed-income certificates.'],
      ['A corporate bond', 1, 'A loan to a company that pays interest.'],
      ['Shares in a listed bank', 2, 'Part-ownership of a company.'],
      ['A global equity index fund', 2, 'Thousands of companies’ shares in one fund.'],
      ['An apartment you rent out', 3, 'Property: income and growth, but hard to sell quickly.'],
      ['Units in a listed REIT', 3, 'Listed exposure to income-producing property.']]},
  'diversification': {type: 'calc', title: 'Check your concentration', intro: 'How much rides on your single largest investment?',
    inputs: [
      {k: 'big', label: 'Value of your largest single holding', v: 60000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'all', label: 'Total value of your investments', v: 200000, step: 1000, min: 1, unit: 'SAR'}],
    outputs: [{label: 'Share in that one holding', fmt: 'pct', big: true, f: v => pct(v.big / v.all)}],
    note: v => { const s = v.big / v.all; return s > 0.2 ? 'That’s high concentration. One company or sector going wrong could hit you hard. Index funds spread the risk cheaply.' : s > 0.1 ? 'On the high side. Fine if it’s a diversified fund; risky if it’s one company.' : 'Well spread, unless your other holdings all move together (same sector or country).'; }},

  // ── Unit 5 · How Markets Work
  'stocks': {type: 'calc', title: 'Your total return on a share', intro: 'Returns come from two places: the price change and the dividends.',
    inputs: [
      {k: 'buy', label: 'Price you paid per share', v: 50, step: 1, min: 0.01, unit: 'SAR'},
      {k: 'sell', label: 'Price now', v: 60, step: 1, min: 0, unit: 'SAR'},
      {k: 'div', label: 'Dividends received per share in total', v: 4, step: 0.5, min: 0, unit: 'SAR'},
      {k: 'yrs', label: 'Years held', v: 3, step: 1, min: 1}],
    outputs: [
      {label: 'From the price change', fmt: 'pct', f: v => pct(v.sell / v.buy - 1)},
      {label: 'From dividends', fmt: 'pct', f: v => pct(v.div / v.buy)},
      {label: 'Total return', fmt: 'pct', big: true, f: v => pct((v.sell + v.div) / v.buy - 1)},
      {label: 'Average per year', fmt: 'pct', f: v => pct(Math.pow((v.sell + v.div) / v.buy, 1 / v.yrs) - 1)}],
    note: () => 'Over short periods prices are noisy. Over the long run, they tend to follow the company’s earnings.'},
  'bonds-sukuk': {type: 'sort', title: 'Does the price rise or fall?', intro: 'What happens to the market price of a bond or sukuk you already own?',
    buckets: ['Price tends to rise', 'Price tends to fall'],
    items: [
      ['Interest rates rise', 1, 'New bonds pay more, so yours is worth less.'],
      ['Interest rates fall', 0, 'Your higher fixed payments become more valuable.'],
      ['The issuer’s credit rating is cut', 1, 'Higher risk means buyers want a higher yield, so they pay less.'],
      ['New 10-year bonds start paying more than yours', 1, 'Buyers can get more income elsewhere.'],
      ['The central bank cuts rates', 0, 'Existing bonds with higher payments become more attractive.'],
      ['The issuer’s finances improve sharply', 0, 'Lower risk means a lower required yield and a higher price.']]},
  'funds-etfs': {type: 'sort', title: 'ETF, mutual fund or REIT?', intro: 'Match each description to the type of fund.',
    buckets: ['ETF', 'Mutual fund', 'REIT'],
    items: [
      ['Trades on the exchange all day at changing prices', 0, 'ETFs trade like shares.'],
      ['Priced once a day, after the market closes', 1, 'Mutual funds deal at the day’s closing value.'],
      ['Owns income-producing property such as offices and malls', 2, 'That’s a real estate investment trust.'],
      ['You buy and redeem units directly with the fund manager', 1, 'Mutual funds deal directly with the manager.'],
      ['Saudi rules require it to pay out most of its net profit each year', 2, 'Saudi REITs must distribute at least 90% of net profits annually.'],
      ['Often tracks an index at a very low annual fee', 0, 'Most ETFs are low-cost index trackers.']]},
  'fees': {type: 'calc', title: 'What fees cost over decades', intro: 'The defaults match the lesson. Enter the fee on a fund you hold or have been offered.',
    inputs: [
      {k: 'p', label: 'Amount invested', v: 100000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'r', label: 'Yearly return before fees', v: 7, step: 0.5, min: 0, unit: '%'},
      {k: 'fee', label: 'Yearly fee', v: 1, step: 0.05, min: 0, unit: '%'},
      {k: 'n', label: 'Years', v: 30, step: 1, min: 1}],
    outputs: [
      {label: 'With no fee', fmt: 'sar', f: v => v.p * Math.pow(1 + v.r / 100, v.n)},
      {label: 'With this fee', fmt: 'sar', f: v => v.p * Math.pow(1 + (v.r - v.fee) / 100, v.n)},
      {label: 'Lost to fees', fmt: 'sar', f: v => v.p * (Math.pow(1 + v.r / 100, v.n) - Math.pow(1 + (v.r - v.fee) / 100, v.n))},
      {label: 'Share of final wealth lost', fmt: 'pct', big: true, f: v => pct(1 - Math.pow((1 + (v.r - v.fee) / 100) / (1 + v.r / 100), v.n))}],
    note: () => 'Try 0.1%, a typical index-fund fee, then 1.5%. Fees are charged every year, in good markets and bad.'},
  'valuation-basics': {type: 'calc', title: 'Work out P/E and dividend yield', intro: 'The defaults match the lesson’s example. Try a real company’s figures.',
    inputs: [
      {k: 'price', label: 'Share price', v: 60, step: 0.5, min: 0.01, unit: 'SAR'},
      {k: 'eps', label: 'Earnings per share (yearly)', v: 3, step: 0.1, unit: 'SAR'},
      {k: 'div', label: 'Dividend per share (yearly)', v: 1.8, step: 0.1, min: 0, unit: 'SAR'}],
    outputs: [
      {label: 'P/E ratio', fmt: 'num', big: true, f: v => v.eps > 0 ? v.price / v.eps : NaN},
      {label: 'Dividend yield', fmt: 'pct', f: v => pct(v.div / v.price)},
      {label: 'Share of earnings paid as dividends', fmt: 'pct', f: v => v.eps > 0 ? pct(v.div / v.eps) : NaN}],
    note: v => v.eps <= 0 ? 'With no earnings, P/E means nothing. Look at other measures and be cautious.' : v.div > v.eps ? 'It pays out more than it earns. That can’t last; a dividend cut may be coming.' : v.div / v.price > 0.08 ? 'A very high yield can be a warning sign that the market expects the dividend to fall.' : 'Compare P/E only with similar companies in the same industry.'},

  // ── Unit 6 · Strategy & Behaviour
  'passive-vs-active': {type: 'calc', title: 'Index fund vs high-fee fund', intro: 'Both funds earn the market return before fees. Only the fees differ.',
    inputs: [
      {k: 'p', label: 'Amount invested', v: 200000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'r', label: 'Market return per year', v: 7, step: 0.5, min: 0, unit: '%'},
      {k: 'fi', label: 'Index fund fee', v: 0.1, step: 0.05, min: 0, unit: '%'},
      {k: 'fa', label: 'Active fund fee', v: 1.5, step: 0.1, min: 0, unit: '%'},
      {k: 'n', label: 'Years', v: 20, step: 1, min: 1}],
    outputs: [
      {label: 'Index fund after fees', fmt: 'sar', f: v => v.p * Math.pow(1 + (v.r - v.fi) / 100, v.n)},
      {label: 'Active fund after fees', fmt: 'sar', f: v => v.p * Math.pow(1 + (v.r - v.fa) / 100, v.n)},
      {label: 'The index investor ends up with', fmt: 'sar', big: true, f: v => v.p * (Math.pow(1 + (v.r - v.fi) / 100, v.n) - Math.pow(1 + (v.r - v.fa) / 100, v.n))}],
    note: () => 'To come out ahead, the active fund must beat the market by more than its extra fee, every year. Most don’t over 10 to 15 years.'},
  'dca-lump-sum': {type: 'calc', title: 'Regular investing in a falling market', intro: 'You invest the same amount each month while the price moves.',
    inputs: [
      {k: 'amt', label: 'Monthly investment', v: 1500, step: 100, min: 0, unit: 'SAR'},
      {k: 'p1', label: 'Price in month 1', v: 10, step: 0.5, min: 0.01, unit: 'SAR'},
      {k: 'p2', label: 'Price in month 2', v: 7.5, step: 0.5, min: 0.01, unit: 'SAR'},
      {k: 'p3', label: 'Price in month 3', v: 10, step: 0.5, min: 0.01, unit: 'SAR'}],
    outputs: [
      {label: 'Units bought', fmt: 'num', f: v => v.amt / v.p1 + v.amt / v.p2 + v.amt / v.p3},
      {label: 'Average price you paid per unit', fmt: 'num', big: true, f: v => 3 * v.amt / (v.amt / v.p1 + v.amt / v.p2 + v.amt / v.p3)},
      {label: 'Simple average of the three prices', fmt: 'num', f: v => (v.p1 + v.p2 + v.p3) / 3},
      {label: 'Value at the month-3 price', fmt: 'sar', f: v => (v.amt / v.p1 + v.amt / v.p2 + v.amt / v.p3) * v.p3}],
    note: () => 'The same amount buys more units when prices are low, so your average cost ends up below the average price. Historically, investing a lump sum at once has done better on average, but regular investing builds the habit and reduces regret.'},
  'asset-allocation': {type: 'calc', title: 'Rebalance to your target', intro: 'The defaults match the lesson: a 70/30 target that drifted after a strong year.',
    inputs: [
      {k: 't', label: 'Target in shares', v: 70, step: 5, min: 0, max: 100, unit: '%'},
      {k: 's', label: 'Shares you hold now', v: 78000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'b', label: 'Sukuk, bonds and cash you hold now', v: 22000, step: 1000, min: 0, unit: 'SAR'}],
    outputs: [
      {label: 'Shares now', fmt: 'pct', f: v => pct(v.s / (v.s + v.b))},
      {label: 'Amount to move', fmt: 'sar', big: true, f: v => Math.abs(v.s - v.t / 100 * (v.s + v.b))}],
    note: v => { const d = v.s - v.t / 100 * (v.s + v.b); return Math.abs(d) < 1 ? 'You’re right on target.' : d > 0 ? 'Sell that amount of shares and buy sukuk or bonds. Rebalancing sells what rose and buys what fell.' : 'Move that amount from sukuk or bonds into shares to get back to your target.'; }},
  'behavioural-biases': {type: 'sort', title: 'Name the bias', intro: 'Which bias is at work in each situation?',
    buckets: ['Loss aversion', 'Herding', 'Recency bias', 'Overconfidence'],
    items: [
      ['Selling everything after a 30% fall to stop the pain', 0, 'Losses hurt about twice as much as gains feel good, so people lock them in.'],
      ['Buying a stock because everyone in your group chat is', 1, 'Following the crowd.'],
      ['Assuming last year’s best sector will keep winning', 2, 'Treating the recent past as the future.'],
      ['Trading often because you’re sure you can time the market', 3, 'Overrating your own skill.'],
      ['Holding a losing share for years to avoid “making the loss real”', 0, 'Avoiding the pain of admitting a loss.'],
      ['Expecting this year’s 25% return every year', 2, 'Extrapolating recent results.'],
      ['Joining a crypto rush after viral posts', 1, 'The crowd, not the facts, is driving the decision.'],
      ['Putting most of your savings into the one sector you “really understand”', 3, 'Confidence leading to concentration.']]},
  'speculation-risks': {type: 'calc', title: 'What leverage does to you', intro: 'The defaults match the lesson: SAR 50,000 of your own money plus SAR 50,000 borrowed.',
    inputs: [
      {k: 'own', label: 'Your own money', v: 50000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'loan', label: 'Borrowed', v: 50000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'chg', label: 'Change in the share price', v: -30, step: 5, unit: '%'}],
    outputs: [
      {label: 'Shares are now worth', fmt: 'sar', f: v => (v.own + v.loan) * (1 + v.chg / 100)},
      {label: 'Left after repaying the loan', fmt: 'sar', f: v => (v.own + v.loan) * (1 + v.chg / 100) - v.loan},
      {label: 'Change in your own money', fmt: 'pct', big: true, f: v => v.own > 0 ? pct(((v.own + v.loan) * (1 + v.chg / 100) - v.loan) / v.own - 1) : NaN}],
    note: v => (v.own + v.loan) * (1 + v.chg / 100) - v.loan < 0 ? 'You’d lose more than everything you put in, and still owe money.' : 'Leverage magnifies both directions, and this ignores the interest on the loan, which makes it worse. Try +30% and −30%.'},

  // ── Unit 7 · Planning Your Financial Life
  'financial-goals': {type: 'calc', title: 'Turn a goal into a monthly amount', intro: 'The default is the lesson’s goal: a SAR 60,000 car in 3 years.',
    inputs: [
      {k: 'goal', label: 'Goal amount', v: 60000, step: 1000, min: 0, unit: 'SAR'},
      {k: 'have', label: 'Already saved for it', v: 0, step: 1000, min: 0, unit: 'SAR'},
      {k: 'm', label: 'Months until you need it', v: 36, step: 1, min: 1}],
    outputs: [{label: 'Save each month', fmt: 'sar', big: true, f: v => Math.max(0, v.goal - v.have) / v.m}],
    note: v => v.m <= 36 ? 'Within 3 years: keep this money in savings or a money-market fund, not shares.' : v.m < 60 ? '3 to 5 years away: mostly savings, with at most a cautious, diversified investment portion.' : 'For goals 5 or more years away, investing can make the monthly amount smaller, with some risk.'},
  'retirement': {type: 'calc', title: 'A rough retirement target', intro: 'The defaults match the lesson. This is a rough guide, not a personal plan.',
    inputs: [
      {k: 'need', label: 'Yearly spending you’ll need in retirement', v: 180000, step: 5000, min: 0, unit: 'SAR'},
      {k: 'pen', label: 'Expected pension per year (e.g. GOSI)', v: 60000, step: 5000, min: 0, unit: 'SAR'},
      {k: 'yrs', label: 'Years until retirement', v: 25, step: 1, min: 1},
      {k: 'r', label: 'Assumed yearly return', v: 5, step: 0.5, min: 0, unit: '%'}],
    outputs: [
      {label: 'Yearly gap to fill', fmt: 'sar', f: v => Math.max(0, v.need - v.pen)},
      {label: 'Target portfolio (gap × 25)', fmt: 'sar', big: true, f: v => Math.max(0, v.need - v.pen) * 25},
      {label: 'Monthly saving to get there', fmt: 'sar', f: v => { const fv = Math.max(0, v.need - v.pen) * 25, r = v.r / 100 / 12, n = v.yrs * 12; return r ? fv * r / (Math.pow(1 + r, n) - 1) : fv / n; }}],
    note: () => 'The “× 25” comes from the 4% rule, a rough historical guide. Starting earlier makes the monthly amount much smaller; try adding 5 years.'},
  'islamic-finance': {type: 'sort', title: 'Name the contract', intro: 'Match each description to the Islamic finance structure.',
    buckets: ['Murabaha', 'Ijara', 'Musharaka / mudaraba', 'Sukuk'],
    items: [
      ['The bank buys a car and sells it to you at a fixed, disclosed profit, paid in instalments', 0, 'Cost-plus sale: murabaha.'],
      ['The bank owns an asset and leases it to you, with ownership passing to you at the end', 1, 'Leasing: ijara (ijara muntahia bittamleek).'],
      ['Partners invest together; profit is shared as agreed and losses by capital contributed', 2, 'A partnership: musharaka.'],
      ['One party provides the money, the other the work; profit is shared as agreed', 2, 'Mudaraba: capital plus expertise.'],
      ['Certificates of ownership in underlying assets that pay a share of their income', 3, 'Sukuk, the sharia-compliant alternative to bonds.'],
      ['Financing for equipment that you rent from the bank until the term ends', 1, 'A lease structure: ijara.']]},
  'financial-plan-capstone': {type: 'steps', title: 'Write your one-page financial plan', intro: 'Fill in every part, even if the honest answer for now is “start with SAR 500 a month”.',
    steps: [
      ['Your numbers: monthly income, spending and net worth today', ''],
      ['Budget and saving: what share do you save automatically on payday?', 'e.g. 20% transferred the day after payday'],
      ['Safety: emergency-fund target and your debt payoff plan', 'e.g. 5 months of essentials; clear the card by June'],
      ['Protection: what insurance or takaful do you need?', 'e.g. family takaful cover while the mortgage is outstanding'],
      ['Investing: goals, target allocation, low-cost funds and your rebalancing rule', 'e.g. 80/20 global equity/sukuk index funds, rebalanced every January'],
      ['Your crash plan: what will you do if markets fall 30%?', 'Write it now, while you’re calm.']],
    sample: 'Income SAR 18,000, spending SAR 14,000, net worth SAR 60,000. Save 20% automatically the day after payday. Emergency fund: 5 months of essentials (SAR 45,000) by next summer; clear the SAR 6,000 card balance by June using the avalanche method. Family takaful cover for the mortgage. Retirement: 80/20 global equity and sukuk index funds, monthly, rebalanced each January. In a 30% crash: keep investing monthly, sell nothing, check the portfolio only at rebalancing time.',
    checks: ['No part is blank', 'Saving is automatic, not left to willpower', 'The crash plan is written down in advance']}
};
})();
