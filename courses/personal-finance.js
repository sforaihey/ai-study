/* Steady course: Personal Finance & Investing. Lesson ids are permanent; progress is stored by id. */
(window.COURSES = window.COURSES || []).push({
id: "personal-finance",
title: "Personal Finance & Investing",
subtitle: "Budgeting, debt, protection and long-term investing.",
icon: "💰",
short: "Finance",
about: "Learn how money really works: build a budget and emergency fund, avoid expensive debt, understand stocks, bonds, sukuk and funds, invest with discipline, and plan for the long term. Examples use Saudi riyals and the Saudi context where relevant.",
disclaimer: "Educational content only, not personal financial, investment, tax or religious advice. For decisions about your own situation, consult a licensed adviser, and for religious rulings a qualified scholar.",
units: [
 {n:1, title:"Money Foundations", blurb:"Cash flow, budgets, inflation and compounding.",
  objectives:["Calculate your net worth and monthly cash flow","Choose a budgeting method and build an emergency fund","Explain inflation and compounding with real numbers"],
  scenarios:[
   ["Noura earns SAR 18,000 a month and spends SAR 17,500, but her credit card balance grows every month. What is most likely happening?",["Some spending isn’t being tracked, so real spending exceeds income","Her income is too high","Her net worth must be rising","Inflation is zero"],0,"If debt grows, real outflows exceed income. Untracked spending, such as irregular or annual costs, is the usual culprit."],
   ["Which is the best place for an emergency fund?",["A safe, easy-to-access savings or money-market account","Individual stocks","A five-year fixed deposit with heavy early-withdrawal penalties","Cryptocurrency"],0,"An emergency fund must be stable and available quickly. Volatile or locked-up assets defeat its purpose."],
   ["Inflation averages 3% a year. Roughly how long until prices double?",["About 24 years","About 3 years","About 72 years","Never"],0,"Rule of 72: 72 ÷ 3 = 24 years."],
   ["Two friends invest SAR 1,000 a month at 7%. One starts at 25, the other at 35; both stop at 60. Why does the early starter end up with more than double?",["Compounding has 10 extra years to work on earlier contributions","The early starter earns a higher rate","The late starter pays more fees","Inflation only affects late starters"],0,"Same rate and monthly amount: about SAR 1.8 million versus about SAR 0.81 million. Time is the most powerful input to compounding."],
   ["A family’s net worth fell this year even though they had no new debt. Which could explain it?",["The value of their assets, such as investments or a car, fell","Their income rose","They paid off a loan","They saved more"],0,"Net worth = assets − liabilities. Falling asset values reduce net worth even with unchanged debt."]
  ]},
 {n:2, title:"Debt & Credit", blurb:"Interest, credit cards, credit records and paying off debt.",
  objectives:["Compare loans correctly using APR, not flat rates","Explain how credit-card debt and minimum payments compound","Choose a debt-payoff strategy and protect your credit record"],
  scenarios:[
   ["Bank A offers a 5-year personal loan at a 5% flat rate. Bank B offers 8% APR. Which is cheaper?",["Bank B: a 5% flat rate over 5 years is about 9.2% APR","Bank A, because 5 is less than 8","They cost exactly the same","It’s impossible to compare"],0,"A flat rate charges interest on the original amount for the whole term. Converted, 5% flat over 5 years is roughly 9.15% APR, so 8% APR is cheaper."],
   ["You have SAR 10,000 on a card charging about 27% a year and pay only the minimum. What happens?",["It takes years to repay and costs thousands extra in interest","The debt disappears in a few months","Interest stops after a year","Your credit limit automatically falls to zero"],0,"In our example it takes about 7 years and roughly SAR 17,000 in total payments to clear SAR 10,000."],
   ["You have three debts. Which payoff method saves the most money in total?",["Avalanche: extra money to the highest-rate debt first","Snowball: smallest balance first","Paying all debts equally","Paying the newest debt first"],0,"Avalanche minimises total interest. Snowball can help motivation, but usually costs more."],
   ["A missed loan payment is reported to the credit bureau. What is the likely impact?",["It can lower your credit record and make future borrowing harder or costlier","Nothing; bureaus ignore missed payments","It raises your score","It cancels the loan"],0,"Payment history is the most important factor in most credit-scoring systems."],
   ["Which borrowing is most likely to be ‘good debt’?",["A reasonably priced loan for education that raises earning power","A cash loan for a holiday","Credit-card debt for daily shopping","A loan to buy shares on margin you can’t afford to lose"],0,"Debt is more defensible when it finances something likely to increase future income or long-term value, at a manageable cost."]
  ]},
 {n:3, title:"Protecting Yourself", blurb:"Insurance, takaful and avoiding scams.",
  objectives:["Decide which risks to insure and which to self-insure","Read the key terms of an insurance or takaful policy","Recognise the warning signs of financial scams"],
  scenarios:[
   ["Which risk is usually most important to insure?",["A rare event that would be financially devastating, like serious illness or death of a breadwinner","Breaking a phone screen","A small parcel lost in the post","A cancelled cinema ticket"],0,"Insurance is most valuable for low-probability, high-cost events you couldn’t absorb. Small losses are usually cheaper to self-insure."],
   ["A friend offers ‘guaranteed 10% a month, no risk’ if you recruit others. This is most likely…",["A Ponzi or pyramid scheme","A government bond","An index fund","A savings account"],0,"Guaranteed high returns plus recruitment are classic scam signals. Real returns come with risk."],
   ["You receive an SMS from ‘your bank’ asking you to confirm your card details via a link. What should you do?",["Don’t click; contact the bank through its official app or number","Click quickly to avoid blocking","Reply with the details","Forward it to friends"],0,"Banks don’t ask for credentials by SMS link. Always use official channels."],
   ["What does a higher insurance deductible (excess) usually do?",["Lowers the premium but raises what you pay per claim","Raises the premium and lowers what you pay per claim","Removes all coverage","Has no effect"],0,"Accepting more of each loss yourself makes the policy cheaper."],
   ["How do you check whether an investment firm in Saudi Arabia is authorised?",["Check the Capital Market Authority’s list of licensed firms","Trust its social-media follower count","Ask the salesperson","Check whether it has an app"],0,"Securities business in Saudi Arabia requires CMA authorisation, and the CMA publishes licensed entities."]
  ]},
 {n:4, title:"Investing Basics", blurb:"Risk, return, asset classes and diversification.",
  objectives:["Explain the link between risk, return and time horizon","Describe the main asset classes and their roles","Use diversification to reduce risk"],
  scenarios:[
   ["You need SAR 50,000 for a house deposit in 12 months. Where should it be?",["Low-risk, accessible savings or a money-market fund","100% in a single stock","A volatile crypto asset","A long-term equity fund"],0,"Money needed soon shouldn’t be exposed to market falls. Equities suit long horizons."],
   ["Why do stocks usually earn more than savings accounts over long periods?",["Investors demand a higher expected return for taking more risk","Stocks are guaranteed by the government","Savings accounts always lose money","Stocks never fall"],0,"Higher expected return is compensation for volatility and the chance of loss."],
   ["An investor holds 10 bank stocks from one country. Are they well diversified?",["No; they share the same sector and country risks","Yes; ten stocks is always enough","Yes; banks never fall together","Diversification doesn’t matter"],0,"Holdings that move together don’t diversify much. Spread across sectors, countries and asset classes."],
   ["Your portfolio fell 25% in a market crash, and you don’t need the money for 20 years. What does history suggest?",["Selling in panic locks in losses; diversified markets have historically recovered over long periods","Always sell immediately","Move everything into one stock to recover faster","Stop investing forever"],0,"Long-horizon investors who stayed invested have historically recovered, though past performance doesn’t guarantee future results."],
   ["What is gold’s typical role in a portfolio?",["A diversifier that may hold value in some crises, but produces no income","A guaranteed high-growth asset","A replacement for an emergency fund","A bond that pays coupons"],0,"Gold can diversify, but it has no cash flows and can be volatile for long periods."]
  ]},
 {n:5, title:"How Markets Work", blurb:"Stocks, bonds, sukuk, funds, fees and valuation.",
  objectives:["Explain what drives the value of stocks, bonds and sukuk","Compare mutual funds, index funds, ETFs and REITs","Calculate the long-term impact of fees and read basic valuation ratios"],
  scenarios:[
   ["Interest rates rise sharply. What usually happens to existing fixed-rate bond prices?",["They fall","They rise","They stay fixed","They become shares"],0,"New bonds pay more, so older lower-coupon bonds become less attractive and their prices drop."],
   ["Fund A charges 1% a year; Fund B, tracking the same index, charges 0.1%. Over 30 years at 7% before fees, SAR 100,000 grows to about…",["SAR 574,000 in A versus SAR 740,000 in B","The same in both","SAR 740,000 in A versus SAR 574,000 in B","SAR 100,000 in both"],0,"Fees compound too. A 0.9% yearly difference costs about SAR 166,000 here."],
   ["Company X trades at a P/E of 40 and Company Y at 10. What can you conclude?",["Investors expect more growth from X, or X is more expensive relative to current earnings; P/E alone doesn’t say which is the better buy","X is definitely better","Y is definitely better","P/E measures debt"],0,"P/E compares price with earnings. A high P/E reflects higher expectations or overvaluation; it needs context."],
   ["What is an ETF?",["A fund that trades on a stock exchange throughout the day, often tracking an index","A type of bank loan","A government savings certificate","A single company share"],0,"Exchange-traded funds hold baskets of assets and trade like shares."],
   ["A REIT mainly gives investors exposure to…",["Income-producing real estate","Government bonds only","Gold","Cryptocurrency"],0,"Real estate investment trusts own or finance property and usually distribute most of their income."]
  ]},
 {n:6, title:"Strategy & Behaviour", blurb:"Passive vs active, allocation, rebalancing and biases.",
  objectives:["Weigh passive versus active investing using evidence","Set an asset allocation and rebalance it","Recognise the behavioural biases that hurt investors"],
  scenarios:[
   ["Over 15 years, what share of actively managed US large-cap funds beat the S&P 500, according to S&P’s SPIVA reports?",["A small minority, roughly one in ten","About half","About nine in ten","All of them"],0,"SPIVA scorecards have repeatedly found that most active large-cap funds underperform their benchmark over long periods."],
   ["Your target is 60% stocks / 40% bonds. After a strong year you’re at 72/28. Rebalancing means…",["Selling some stocks and buying bonds to return to 60/40","Buying more stocks because they’re winning","Doing nothing ever","Selling everything"],0,"Rebalancing restores your chosen risk level, which means trimming what grew."],
   ["You hold a losing stock ‘until it gets back to what I paid’. Which bias is this?",["Loss aversion / anchoring on purchase price","Diversification","Rebalancing","Compounding"],0,"The purchase price is irrelevant to future returns. Decide on prospects, not on breaking even."],
   ["Everyone at work is buying a hot stock after it doubled. Which bias is at play?",["Herding and recency bias","Loss aversion","Home bias","Rebalancing"],0,"Following the crowd after big recent gains is a common route to buying high."],
   ["What is the main risk of buying shares with borrowed money (leverage)?",["Losses are magnified and can exceed your own money","It guarantees higher returns","It removes market risk","It lowers fees"],0,"Leverage amplifies both gains and losses, and forced selling can lock in losses."]
  ]},
 {n:7, title:"Planning Your Financial Life", blurb:"Goals, retirement, Islamic finance and your plan.",
  objectives:["Turn goals into amounts, dates and monthly savings","Estimate retirement needs and understand withdrawal rules","Explain the core principles of Islamic finance and zakat"],
  scenarios:[
   ["You want SAR 60,000 in 3 years for a car without borrowing. Ignoring returns, how much should you save monthly?",["About SAR 1,667","About SAR 600","About SAR 5,000","About SAR 20,000"],0,"60,000 ÷ 36 months ≈ SAR 1,667. A specific, dated goal makes saving concrete."],
   ["Using the ‘4% rule’ rule of thumb, roughly how large a portfolio supports SAR 120,000 a year in withdrawals?",["About SAR 3 million","About SAR 480,000","About SAR 12 million","About SAR 1.2 million"],0,"120,000 ÷ 0.04 = 3,000,000. It is a rough, US-history-based guideline, not a guarantee."],
   ["What is the key difference between a conventional bond and a sukuk?",["A sukuk gives holders an interest in underlying assets or projects, with returns from those assets rather than interest on a loan","There is no difference","Sukuk always pay more","Sukuk can’t be traded"],0,"Sukuk are structured as ownership in assets or ventures to comply with the prohibition of riba."],
   ["Zakat on savings is commonly calculated as…",["2.5% of qualifying wealth above the nisab held for a lunar year","15% of income each month","10% of your salary","1% of your house value"],0,"The widely applied rate is 2.5% on zakatable wealth above the nisab after a full lunar year. Consult a scholar for your situation."],
   ["Which is the best first step in a personal financial plan?",["Know your numbers: income, spending, debts and net worth","Pick a hot stock","Buy the most expensive insurance","Take a loan to invest"],0,"Every plan starts with an honest picture of where you are now."]
  ]}
],
lessons: [

/* ───────── Unit 1 · Money Foundations ───────── */
{id:"cash-flow-net-worth", unit:1, title:"Cash Flow & Net Worth", intro:"Two numbers that tell you where you really stand.",
 body:[
  "Cash flow is what comes in minus what goes out over a period, usually a month. Positive cash flow means you have money left to save, invest or pay down debt. Negative cash flow means you are funding your lifestyle with savings or borrowing, even if it doesn’t feel that way.",
  "Net worth is a snapshot: everything you own (assets: cash, investments, property, end-of-service benefits, the resale value of your car) minus everything you owe (liabilities: loans, credit-card balances, instalment plans). Your income doesn’t determine wealth; the gap between income and spending, sustained over years, does.",
  "Track both. Cash flow tells you whether your habits are building wealth; net worth tells you whether it is actually growing. Review cash flow monthly and net worth every quarter or year."
 ],
 points:["Cash flow = money in − money out over a period.","Net worth = assets − liabilities, at a point in time.","High income doesn’t mean wealth; the savings gap does.","Track cash flow monthly and net worth yearly."],
 example:"Faisal earns SAR 20,000 a month and spends SAR 16,000: cash flow +4,000. He has SAR 40,000 savings, SAR 60,000 in a fund and a car worth SAR 50,000, and owes SAR 70,000 on a car loan. Net worth = 150,000 − 70,000 = SAR 80,000.",
 myth:"Myth: “A big salary means I’m doing well financially.” Reality: many high earners have low or negative net worth because spending and debt rise with income.",
 try:"Write down your monthly take-home income and your three biggest spending categories. Then list your main assets and debts and calculate your net worth.",
 deeper:["Irregular costs (annual insurance, school fees, Ramadan and Eid spending, travel, car maintenance) are the most common reason budgets fail. Divide each yearly cost by 12 and treat it as a monthly expense.","Lifestyle inflation (spending more as income rises) is natural, but deciding in advance to save a fixed share of every raise protects your progress."],
 terms:[["Cash flow","Money coming in minus money going out over a period."],["Net worth","The value of everything you own minus everything you owe."],["Asset","Something you own that has financial value."],["Liability","Money you owe to someone else."],["Lifestyle inflation","Spending more as income rises, leaving savings unchanged."]],
 quiz:[
  ["Which formula gives net worth?",["Assets minus liabilities","Income minus expenses","Salary times twelve","Savings plus income"],0,"Net worth is a snapshot of what you own minus what you owe. Income minus expenses is cash flow."],
  ["Someone earning SAR 30,000 a month spends SAR 32,000. What is true?",["Their cash flow is negative, so debt or drawn-down savings is filling the gap","They are building wealth quickly","Their net worth must be rising","Cash flow doesn’t matter at high incomes"],0,"Spending more than you earn means borrowing or using savings, whatever the income."],
  ["Why convert annual costs like insurance into a monthly amount?",["So irregular costs don’t ambush your budget","Because insurers require it","It lowers the cost","It raises your net worth"],0,"Setting aside 1/12 each month smooths irregular expenses into your plan."]
 ]},

{id:"budgeting", unit:1, title:"Budgeting That Works", intro:"A plan for your money before the month starts.",
 body:[
  "A budget is a plan that tells your money where to go, instead of wondering where it went. The best budget is the one you will actually keep; precision matters less than consistency.",
  "Three popular methods: the 50/30/20 rule splits take-home pay into roughly 50% needs, 30% wants and 20% savings and debt repayment. Zero-based budgeting gives every riyal a job, so income minus planned spending and saving equals zero. Pay yourself first moves savings out automatically on payday, then you spend what remains.",
  "Automation is the most powerful budgeting tool. Standing transfers to savings and investments on payday turn good intentions into habits, and remove the need for willpower each month."
 ],
 points:["A budget is a plan made before the month, not a record after it.","50/30/20: needs, wants, savings.","Zero-based: every riyal is assigned.","Pay yourself first and automate savings on payday."],
 example:"Sara takes home SAR 15,000. Using 50/30/20: SAR 7,500 for needs (rent, food, transport, bills), SAR 4,500 for wants, SAR 3,000 automatically transferred to savings and investments on payday.",
 myth:"Myth: “Budgets mean never enjoying money.” Reality: a good budget includes planned spending on things you value, guilt-free, because savings are already handled.",
 try:"Set up an automatic transfer on your next payday, even a small one, to a separate savings account. Choose the method (50/30/20, zero-based or pay-yourself-first) that fits you best.",
 deeper:["If 50% isn’t enough for needs, for example where housing costs are high, adjust the percentages but keep a fixed savings rate. A savings rate of 15–20% or more is a common long-term target.","Separate accounts for different goals (emergency, travel, investing) reduce the temptation to dip into savings, a technique sometimes called mental accounting used to your advantage."],
 terms:[["Budget","A plan for how income will be spent, saved and invested."],["50/30/20 rule","A guideline splitting take-home pay into 50% needs, 30% wants and 20% savings."],["Zero-based budget","A budget where every unit of income is assigned a purpose."],["Pay yourself first","Saving automatically before spending on anything else."],["Savings rate","The share of income that is saved or invested."]],
 quiz:[
  ["In the 50/30/20 rule, what is the 20%?",["Savings and debt repayment","Wants","Rent","Taxes"],0,"The 20% goes to savings, investing and paying down debt."],
  ["What makes ‘pay yourself first’ effective?",["Savings happen automatically before spending temptations","It increases your salary","It removes the need for a bank account","It means never spending"],0,"Automating savings on payday removes reliance on willpower."],
  ["Your needs take 62% of income because rent is high. What’s a sensible response?",["Adjust the split but protect a fixed savings rate","Abandon budgeting","Stop saving entirely","Take a loan for rent"],0,"The percentages are a guide. The essential habit is a consistent savings rate."]
 ]},

{id:"emergency-fund", unit:1, title:"Your Emergency Fund", intro:"The buffer that keeps a bad month from becoming debt.",
 body:[
  "An emergency fund is cash set aside for unexpected events: job loss, medical bills, urgent car or home repairs. Without one, surprises go on credit cards or loans, which can trap you in expensive debt.",
  "A common guideline is 3–6 months of essential expenses. Aim for the higher end if your income is variable, you are self-employed, you have dependants, or you are the only earner. Build it before investing heavily, and start with a smaller first target, such as one month.",
  "Keep it safe and accessible: a separate savings account or a low-risk money-market fund, not stocks or crypto. Its job is to be there when markets and your income are both having a bad time."
 ],
 points:["Cover 3–6 months of essential expenses.","Build it before investing heavily.","Keep it safe, separate and quickly accessible.","Refill it after you use it."],
 example:"Essential monthly costs of SAR 9,000 mean a target of SAR 27,000–54,000. Saving SAR 2,000 a month reaches the first month (SAR 9,000) in under five months.",
 myth:"Myth: “I have a credit card, so I don’t need an emergency fund.” Reality: credit can be reduced or withdrawn when you most need it, and it turns an emergency into costly debt.",
 try:"Calculate your essential monthly expenses (housing, food, utilities, transport, minimum debt payments). Multiply by three to get your first emergency-fund target.",
 deeper:["‘Essential expenses’ are what you must pay if you cut all extras, usually lower than your normal spending, which makes the target more achievable.","End-of-service benefits and similar entitlements can help, but they aren’t immediately accessible and depend on circumstances, so don’t count them as your emergency fund."],
 terms:[["Emergency fund","Cash reserved for unexpected expenses or loss of income."],["Liquidity","How quickly an asset can be turned into cash without losing value."],["Money-market fund","A fund investing in short-term, low-risk instruments, used to hold cash."]],
 quiz:[
  ["What is a common emergency-fund target?",["3–6 months of essential expenses","One week of salary","10 years of income","Nothing if you have a credit card"],0,"Three to six months is the usual guideline, more if income is uncertain."],
  ["Why shouldn’t an emergency fund be in stocks?",["Stocks can fall sharply right when you need the money","Stocks are illegal","Stocks pay no returns ever","Banks forbid it"],0,"Emergencies and market crashes often coincide. Emergency money needs stability."],
  ["Who should aim for a larger emergency fund?",["A self-employed person with variable income","Someone with very stable income and no dependants","Nobody","Only retirees"],0,"Less predictable income calls for a bigger buffer."]
 ]},

{id:"inflation", unit:1, title:"Inflation & Purchasing Power", intro:"Why cash that sits still slowly shrinks.",
 body:[
  "Inflation is the general rise in prices over time. When inflation is 3%, something that costs SAR 100 today costs about SAR 103 next year. The same riyal buys less, so your money loses purchasing power.",
  "The real return of an investment is its return after inflation. A savings account paying 2% when inflation is 3% has a real return of about −1%: your balance grows, but what it can buy shrinks.",
  "Over long periods the effect is large. At 3% inflation, SAR 100,000 has the purchasing power of only about SAR 55,000 after 20 years. That is why long-term money needs investments expected to beat inflation, while short-term money prioritises safety."
 ],
 points:["Inflation = prices rising, money buying less.","Real return ≈ nominal return − inflation.","Cash loses purchasing power over long periods.","Long-term money needs growth that beats inflation."],
 example:"At 3% inflation, SAR 100,000 kept as cash for 20 years buys what about SAR 55,000 buys today.",
 myth:"Myth: “Keeping cash is the safe choice for everything.” Reality: cash is safe from market swings but not from inflation. For long horizons, it carries a quiet, steady loss.",
 try:"Find a price you remember from five years ago (coffee, rent, a car) and compare it with today. Calculate the yearly increase.",
 deeper:["Central banks typically target low, stable inflation (around 2% in many economies). The Saudi riyal has been pegged to the US dollar at 3.75 since 1986, so Saudi monetary policy closely follows US interest-rate moves.","Personal inflation differs from the official index: if your spending is heavy on housing or education, your own inflation rate may be higher or lower than the national figure."],
 terms:[["Inflation","The general rise in prices over time."],["Purchasing power","How much a unit of money can buy."],["Real return","Investment return after subtracting inflation."],["Nominal return","Investment return before adjusting for inflation."]],
 quiz:[
  ["A deposit pays 2% while inflation is 4%. The real return is about…",["−2%","+6%","+2%","0%"],0,"Real return ≈ 2% − 4% = −2%. Your money buys less over time."],
  ["Why is inflation a risk for long-term cash savings?",["It steadily erodes what the money can buy","It makes cash disappear from accounts","It raises the cash balance","It only affects stocks"],0,"The number in the account stays, but its purchasing power falls."],
  ["The Saudi riyal is pegged to which currency?",["US dollar","Euro","Chinese yuan","British pound"],0,"The riyal has been pegged at 3.75 per US dollar since 1986."]
 ]},

{id:"compounding", unit:1, title:"Compounding & the Rule of 72", intro:"Earning returns on your returns.",
 body:[
  "Compounding means your returns earn their own returns. SAR 10,000 growing at 7% becomes 10,700 after a year; in year two, the 7% applies to 10,700, not 10,000. Over decades, this snowball effect dominates.",
  "Time is the most powerful ingredient. Investing SAR 1,000 a month at 7% from age 25 to 60 grows to about SAR 1.8 million. Starting at 35 with the same amount reaches only about SAR 0.81 million: ten years’ delay costs more than half the result.",
  "The Rule of 72 is a quick shortcut: divide 72 by the annual rate to estimate how many years it takes to double. At 6%, about 12 years; at 9%, about 8 years. It works for debt too, which is why high-interest debt grows alarmingly fast."
 ],
 points:["Compounding = returns earning returns.","Starting early matters more than investing large amounts later.","Rule of 72: years to double ≈ 72 ÷ rate.","Compounding works against you on debt."],
 example:"SAR 100,000 at 7% a year for 30 years grows to about SAR 761,000. Most of that is growth on growth, not the original money.",
 myth:"Myth: “I’ll start investing when I earn more.” Reality: small amounts started early often beat larger amounts started late, because time does the heavy lifting.",
 try:"Use the Rule of 72 to estimate how long your savings would take to double at 4%, 7% and 10%. Then do the same for a credit card at 27%.",
 deeper:["Returns are never smooth in reality; markets rise and fall. Long-term average returns used in examples (like 7%) are assumptions, not promises.","The formula behind compounding is FV = PV × (1 + r)^n, where r is the rate per period and n the number of periods."],
 terms:[["Compounding","Growth where returns are added to the base and earn further returns."],["Rule of 72","Shortcut: years to double ≈ 72 ÷ annual rate (%)."],["Future value (FV)","What money will be worth at a future date after growth."],["Time horizon","How long money can stay invested before it is needed."]],
 quiz:[
  ["At 8% a year, roughly how long does money take to double?",["About 9 years","About 4 years","About 20 years","About 72 years"],0,"72 ÷ 8 = 9 years."],
  ["What is the biggest advantage of starting to invest early?",["More time for compounding to work","Lower taxes everywhere","Guaranteed returns","No risk"],0,"Time multiplies growth. Each extra year compounds on everything before it."],
  ["Why does credit-card debt grow so quickly?",["Interest compounds on unpaid interest at a high rate","Banks add random fees","Inflation doubles it","It doesn’t grow"],0,"At around 27% a year, the Rule of 72 says unpaid debt roughly doubles in under three years."]
 ]},

/* ───────── Unit 2 · Debt & Credit ───────── */
{id:"interest-apr", unit:2, title:"Interest, APR & Flat Rates", intro:"How to compare the real cost of borrowing.",
 body:[
  "Interest (or profit, in sharia-compliant financing) is the price of borrowing money. The way it is quoted can make loans look cheaper than they are.",
  "A flat rate is calculated on the original loan amount for the whole term, even though you repay part of it every month. The annual percentage rate (APR) reflects the true yearly cost of the outstanding balance, including most fees. A 5% flat rate over five years is roughly a 9.2% APR, almost double what it sounds like.",
  "Always compare loans by APR and by the total amount you will repay. Regulators in many countries require lenders to disclose the APR, so ask for it. Also check fees, early-settlement terms and whether the rate is fixed or variable."
 ],
 points:["Flat rates understate the true cost of instalment loans.","Compare loans by APR and total amount repaid.","5% flat over 5 years ≈ 9.2% APR.","Check fees, early-settlement rules and fixed vs variable."],
 example:"SAR 100,000 at a 5% flat rate for 5 years: interest = 100,000 × 5% × 5 = SAR 25,000, monthly payment SAR 2,083. The equivalent APR is about 9.15%.",
 myth:"Myth: “A 5% loan and a 5% loan cost the same.” Reality: 5% flat and 5% APR are very different prices. Always convert to APR.",
 try:"Find the terms of any loan or financing you have (or an online offer). Identify the APR, total repayment and early-settlement fee.",
 deeper:["Islamic financing products such as murabaha (cost-plus sale) charge a profit rate instead of interest, but the cost to you can still be compared using APR and total repayment.","Variable rates move with a benchmark. In Saudi Arabia, many variable-rate products reference SAIBOR, which tends to move with US rates because of the riyal’s dollar peg."],
 terms:[["Interest","The cost of borrowing money, usually expressed as a rate."],["APR","Annual percentage rate: the yearly cost of borrowing, including most fees."],["Flat rate","Interest calculated on the original loan amount for the entire term."],["Early settlement","Repaying a loan before the end of its term, sometimes with a fee."]],
 quiz:[
  ["Which is the better way to compare two loans?",["APR and total amount repaid","The flat rate only","The monthly payment only","The bank’s logo"],0,"APR and total repayment capture the true cost; monthly payment can hide a longer term."],
  ["Why is a flat rate misleading?",["It charges on the full original amount even as you repay it","It is always higher than APR","It includes no interest","It is illegal"],0,"You pay interest on money you have already repaid, so the effective rate is higher."],
  ["A lower monthly payment achieved by stretching a loan from 3 to 6 years usually means…",["More total interest paid","Less total interest paid","No change in cost","A lower APR automatically"],0,"Longer terms reduce each payment but increase total interest."]
 ]},

{id:"credit-cards", unit:2, title:"Credit Cards Without the Trap", intro:"A great tool if you pay in full; an expensive one if you don’t.",
 body:[
  "A credit card lets you borrow up to a limit. If you pay the full statement balance by the due date, you usually pay no interest or profit charge on purchases. If you don’t, charges apply at a high rate, often 20–30% a year or more.",
  "The minimum payment is designed to keep you borrowing. Paying only the minimum on SAR 10,000 at about 27% a year (with a 5% minimum) takes around seven years and costs roughly SAR 17,000 in total. Cash withdrawals on credit cards are usually charged immediately and with extra fees.",
  "Use cards for convenience, protection and rewards, never as extra income. Set up automatic payment of the full balance, keep utilisation low and avoid instalment offers you don’t understand."
 ],
 points:["Pay the full statement balance every month.","Minimum payments stretch debt over years.","Avoid cash withdrawals on credit cards.","Automate full payment and keep balances low."],
 example:"A SAR 10,000 balance at ~27% a year with 5% minimum payments takes about 83 months to clear and costs about SAR 16,970 in total.",
 myth:"Myth: “Rewards points make card spending worth it.” Reality: rewards are typically worth 1–2%; carrying a balance at 25%+ wipes them out many times over.",
 try:"Check your latest card statement: find the APR (or profit rate), the minimum payment and the date interest starts. Set up automatic full payment.",
 deeper:["In Saudi Arabia many credit cards are sharia-compliant and use structures such as tawarruq or fixed fees instead of interest. The cost of carrying a balance can still be high, so compare APR and fees.","Buy-now-pay-later services can be interest-free if paid on time, but late fees and multiple overlapping plans can quietly strain a budget."],
 terms:[["Credit limit","The maximum amount you can borrow on a card."],["Minimum payment","The smallest amount you must pay each month to avoid default."],["Statement balance","The amount owed at the end of a billing cycle."],["Credit utilisation","The share of available credit you are using."],["BNPL","Buy now, pay later: splitting a purchase into instalments."]],
 quiz:[
  ["How do you usually avoid paying interest on card purchases?",["Pay the full statement balance by the due date","Pay the minimum on time","Use the card only at weekends","Withdraw cash instead"],0,"Paying the full balance by the due date normally avoids purchase charges."],
  ["Why is paying only the minimum costly?",["The remaining balance keeps compounding at a high rate","Minimum payments are taxed","It closes the card","It has no cost"],0,"Most of each minimum payment goes on charges, so the balance falls slowly."],
  ["Which credit-card use is usually most expensive?",["Cash withdrawals","Online shopping paid in full","Groceries paid in full","Recurring bills paid in full"],0,"Cash advances typically incur immediate charges plus fees."]
 ]},

{id:"credit-record", unit:2, title:"Your Credit Record", intro:"Your financial reputation, in data.",
 body:[
  "A credit bureau collects information on how you use credit: loans, cards, instalments, and whether you pay on time. Lenders use this record, often summarised as a credit score, to decide whether to lend and at what price. In Saudi Arabia the main credit bureau is SIMAH.",
  "The biggest factor is payment history: missed or late payments hurt most and stay on record for years. Other factors typically include how much of your available credit you use, the length of your credit history, and how many new applications you make.",
  "A good record means easier approvals and better rates. Protect it by paying on time (automate it), keeping balances low, applying for credit only when needed, and checking your report for errors."
 ],
 points:["Credit bureaus record your borrowing and repayment behaviour.","Payment history matters most.","Keep utilisation low and avoid many applications at once.","Check your report and dispute errors."],
 example:"Two applicants request the same car financing. The one with years of on-time payments gets approved at a lower rate; the one with recent late payments is offered a higher rate or declined.",
 myth:"Myth: “Checking my own credit report lowers my score.” Reality: checking your own report generally doesn’t hurt; lenders’ hard inquiries from applications can.",
 try:"Request your own credit report from your country’s credit bureau (SIMAH in Saudi Arabia) and check every account listed is correct.",
 deeper:["Being a guarantor for someone else’s loan can affect your own record if they don’t pay.","Closing old accounts can shorten your credit history and raise utilisation, so consider the effect before closing them."],
 terms:[["Credit bureau","An organisation that collects and reports people’s credit histories."],["Credit score","A number summarising creditworthiness based on credit history."],["Payment history","The record of whether debts were paid on time."],["SIMAH","Saudi Credit Bureau, which maintains credit records in Saudi Arabia."],["Hard inquiry","A lender’s check of your credit file after you apply for credit."]],
 quiz:[
  ["What usually affects a credit score the most?",["Payment history","Your salary","Your age","The bank you use"],0,"On-time repayment is the dominant factor in most scoring systems."],
  ["Which habit helps your credit record?",["Automating on-time payments","Applying for many cards at once","Maxing out your limit","Ignoring statements"],0,"Automation prevents accidental late payments."],
  ["What is SIMAH?",["Saudi Arabia’s credit bureau","A type of loan","A stock index","An insurance company"],0,"SIMAH maintains credit information used by lenders in Saudi Arabia."]
 ]},

{id:"paying-off-debt", unit:2, title:"Paying Off Debt", intro:"A plan beats good intentions.",
 body:[
  "List every debt with its balance, rate (APR) and minimum payment. Always pay all minimums to protect your record, then direct every extra riyal to one target debt at a time.",
  "The avalanche method targets the highest-rate debt first. It saves the most money. The snowball method targets the smallest balance first; quick wins can boost motivation, though usually at a higher total cost. Either beats no plan.",
  "Other tools: refinancing or consolidating into a cheaper loan (check the APR and fees, and don’t run the old cards back up), negotiating with lenders early if you’re struggling, and stopping new borrowing while you pay down."
 ],
 points:["List debts by balance, APR and minimum payment.","Avalanche (highest rate first) saves the most money.","Snowball (smallest first) builds motivation.","Consolidate only if the APR is lower and you stop new borrowing."],
 example:"Debts: card SAR 8,000 at 27%, personal loan SAR 40,000 at 9% APR, instalment SAR 3,000 at 0%. Avalanche puts extra money on the card first; snowball would start with the SAR 3,000 instalment.",
 myth:"Myth: “I should invest before paying off a 27% card.” Reality: paying off a 27% debt is a guaranteed 27% return. Few investments reliably beat that.",
 try:"List all your debts with APR and balance. Decide whether you’d use avalanche or snowball, and set the target debt.",
 deeper:["Once a debt is paid off, roll its payment into the next debt. This ‘debt roll-down’ accelerates progress.","If debt is overwhelming, speak to the lender early. Restructuring options are usually better before payments are missed."],
 terms:[["Avalanche method","Paying extra on the highest-interest debt first."],["Snowball method","Paying extra on the smallest balance first."],["Debt consolidation","Combining several debts into one loan, ideally at a lower rate."],["Refinancing","Replacing an existing loan with a new one on different terms."]],
 quiz:[
  ["Which payoff method minimises total interest?",["Avalanche","Snowball","Random order","Paying only minimums"],0,"Targeting the highest rate first reduces total interest cost."],
  ["When does debt consolidation make sense?",["When the new APR is lower and you stop adding new debt","Always","Never","Only for mortgages"],0,"Consolidation helps only if it is cheaper and you don’t refill the old cards."],
  ["Paying off a 27% credit card is like earning…",["A guaranteed 27% return","A 2% return","Nothing","A loss"],0,"Every riyal repaid avoids 27% in future charges."]
 ]},

/* ───────── Unit 3 · Protecting Yourself ───────── */
{id:"insurance-takaful", unit:3, title:"Insurance & Takaful Basics", intro:"Transfer the risks you can’t afford to carry.",
 body:[
  "Insurance transfers a financial risk to an insurer in exchange for a premium. It makes most sense for events that are unlikely but would be financially devastating: serious illness, disability, death of an earner, major property damage or liability claims.",
  "Takaful is the sharia-compliant alternative. Participants contribute to a shared fund that compensates members who suffer losses; the operator manages the fund for a fee and any surplus may be shared. In Saudi Arabia, insurance follows a cooperative model and is regulated by the Insurance Authority.",
  "Key terms to read: what is covered and excluded, the deductible (excess) you pay per claim, limits, waiting periods and renewal conditions. Self-insure small losses (like a phone screen) using your emergency fund rather than paying for many small policies."
 ],
 points:["Insure low-probability, high-impact risks.","Takaful is a cooperative, sharia-compliant model.","Read coverage, exclusions, deductibles and limits.","Self-insure small, affordable losses."],
 example:"A family with one main earner considers life cover (or family takaful) so that, if the earner dies, the family can repay the mortgage and cover living costs for several years.",
 myth:"Myth: “Insurance is a waste if I never claim.” Reality: you are buying protection from catastrophe. Not claiming is the best outcome.",
 try:"List your top three financial risks (e.g. health, income loss, home). For each, decide: insure, self-insure, or reduce the risk.",
 deeper:["Health insurance is mandatory for many employees and residents in Saudi Arabia through employer schemes; check what your policy covers before assuming you’re fully protected.","Extended warranties and gadget insurance are often expensive relative to the risk they cover."],
 terms:[["Premium","The amount paid for an insurance policy."],["Deductible (excess)","The part of each claim the policyholder pays."],["Takaful","A cooperative, sharia-compliant system of mutual protection."],["Exclusion","Something a policy specifically does not cover."],["Self-insure","Covering small potential losses from your own savings instead of buying insurance."]],
 quiz:[
  ["Which event is insurance most useful for?",["Rare but financially devastating events","Small everyday losses","Predictable monthly bills","Investment returns"],0,"Insurance is best for risks you couldn’t absorb yourself."],
  ["What is takaful?",["A cooperative, sharia-compliant form of mutual protection","A type of credit card","A stock index","A savings account"],0,"Participants pool contributions to protect each other, consistent with Islamic principles."],
  ["Raising your deductible usually…",["Lowers the premium","Raises the premium","Cancels the policy","Doubles coverage"],0,"You accept more of each loss, so the insurer charges less."]
 ]},

{id:"scams-fraud", unit:3, title:"Spotting Scams & Fraud", intro:"If it sounds too good to be true, it is.",
 body:[
  "Financial scams rely on urgency, greed, fear or trust. Common types: Ponzi and pyramid schemes paying ‘returns’ from new investors’ money; fake investment platforms and ‘trading signals’ groups; phishing messages pretending to be your bank or a government service; and impersonation calls, now including AI voice cloning.",
  "Warning signs: guaranteed high returns with no risk; pressure to act fast; requests for secrecy; payment in crypto, gift cards or to a personal account; unlicensed firms; and anyone asking for your password, PIN or one-time code.",
  "Protect yourself: never share OTPs or passwords; contact institutions only through official apps or numbers; verify that investment firms are licensed by the regulator (in Saudi Arabia, the Capital Market Authority); and enable transaction alerts. If something feels off, pause; scammers depend on rushing you."
 ],
 points:["Guaranteed high returns + no risk = red flag.","Never share passwords, PINs or one-time codes.","Verify firms with the regulator’s licensed list.","Use official channels; slow down when pressured."],
 example:"A social-media ad shows a celebrity ‘endorsing’ a platform promising 5% a week. The celebrity never endorsed it, the firm isn’t licensed, and early ‘profits’ are paid from new deposits until withdrawals freeze.",
 myth:"Myth: “Only careless or older people fall for scams.” Reality: modern scams are professional and target everyone, especially when people are busy, stressed or excited.",
 try:"Turn on transaction alerts for all your cards and accounts. Then look up your regulator’s list of licensed investment firms and bookmark it.",
 deeper:["Legitimate institutions never need your OTP to ‘cancel’ or ‘verify’ a transaction. An OTP is the final authorisation for a payment.","If you’ve been scammed, contact your bank immediately through official channels and report it to the authorities. Speed improves the chance of stopping transfers."],
 terms:[["Ponzi scheme","A fraud paying earlier investors with money from new investors."],["Phishing","Fraudulent messages designed to steal credentials or money."],["OTP","One-time password used to authorise a login or payment."],["Capital Market Authority (CMA)","The Saudi regulator for securities markets and investment firms."]],
 quiz:[
  ["Which is the strongest scam warning sign?",["Guaranteed high returns with no risk","A licensed firm with published fees","A bank asking you to visit a branch","An index fund with low fees"],0,"Real investments always carry risk. Guarantees of high returns are a classic fraud signal."],
  ["Someone claiming to be from your bank asks for the OTP you just received. You should…",["Refuse and call the bank through its official number","Read it out to help them","Send it by SMS","Post it online"],0,"An OTP authorises transactions. Banks never ask you to share it."],
  ["How can you check if an investment firm in Saudi Arabia is legitimate?",["Check that it is licensed by the Capital Market Authority","Look at its Instagram followers","Trust a friend’s recommendation","See if the website looks professional"],0,"Authorised firms are listed by the CMA."]
 ]},

/* ───────── Unit 4 · Investing Basics ───────── */
{id:"saving-vs-investing", unit:4, title:"Saving vs Investing", intro:"Different jobs for different money.",
 body:[
  "Saving means keeping money safe and accessible, usually in deposits or money-market funds. It protects against loss but tends to grow slowly, often around inflation or below it.",
  "Investing means buying assets such as shares, bonds, sukuk, funds or property that are expected to grow or pay income over time. Investing accepts the risk of short-term losses in exchange for higher expected long-term returns.",
  "Match money to time horizon. Money needed within about 3 years belongs in savings. Money for goals 5+ years away can usually be invested, because there is time to recover from market falls. Between those, use a mix."
 ],
 points:["Saving = safety and access; investing = growth with risk.","Short-term money (under ~3 years) → savings.","Long-term money (5+ years) → investing.","Emergency fund first, then invest."],
 example:"Huda keeps her emergency fund and next year’s wedding budget in savings, and invests monthly in a diversified fund for retirement 25 years away.",
 myth:"Myth: “Investing is gambling.” Reality: speculating on short-term moves can resemble gambling; owning a diversified share of productive businesses for decades is very different.",
 try:"Sort your goals into short (under 3 years), medium (3–5) and long (5+) term, and decide which money should be saved and which invested.",
 deeper:["Investing doesn’t require large sums. Many funds and platforms allow small monthly contributions, which also average out your purchase prices over time.","Before investing, clear high-interest debt and build at least a starter emergency fund."],
 terms:[["Saving","Setting money aside in safe, accessible forms."],["Investing","Buying assets expected to grow or generate income over time."],["Risk","The possibility that actual returns differ from expected, including losses."],["Return","The gain or loss on an investment, usually expressed as a percentage."]],
 quiz:[
  ["Money you need in 18 months should usually be…",["Saved in low-risk, accessible accounts","Invested in shares","Put in a single stock","Used to buy crypto"],0,"Short horizons can’t ride out market falls."],
  ["What do investors accept in exchange for higher expected returns?",["The risk of losses and volatility","A guarantee from the bank","Lower fees","No access to their money ever"],0,"Return is compensation for bearing risk."],
  ["What should normally come before investing?",["Paying off high-interest debt and building an emergency fund","Buying the most popular stock","Taking a loan to invest","Nothing"],0,"Remove expensive debt and secure a buffer first."]
 ]},

{id:"risk-return", unit:4, title:"Risk, Return & Time Horizon", intro:"No free lunch, but time is on your side.",
 body:[
  "Risk and expected return are linked: assets with higher expected long-term returns, like shares, also swing more and can fall sharply. Lower-risk assets, like deposits and high-quality short-term bonds, are steadier but grow more slowly.",
  "Volatility is how much prices move up and down. A drawdown is a fall from a previous peak. Global share markets have had several drawdowns of 30–50%, for example in 2008–09 and briefly in 2020, followed by recoveries that took months to years.",
  "Your risk capacity depends on your time horizon, income stability and emergency fund. Your risk tolerance is how much volatility you can live with without panic-selling. A good plan respects both, because the worst outcome is buying high and selling low."
 ],
 points:["Higher expected return comes with higher risk.","Volatility and drawdowns are normal for shares.","Longer horizons give more time to recover.","Choose a risk level you can stick with in a crash."],
 example:"An investor 25 years from retirement can tolerate a 30% temporary fall in a share-heavy portfolio; someone retiring next year generally can’t.",
 myth:"Myth: “If I pick well, I can get high returns with low risk.” Reality: consistently high returns with low risk are a classic fraud signal. Reward requires risk.",
 try:"Imagine your investments fall 30% in one month. Write down honestly what you would do. That reaction tells you your real risk tolerance.",
 deeper:["Risk isn’t only volatility: there is inflation risk (cash losing value), concentration risk (one company), liquidity risk (can’t sell quickly), currency risk and the risk of not reaching your goal.","Past performance doesn’t guarantee future results. Long-run historical averages are useful guides, not promises."],
 terms:[["Volatility","How much an investment’s price moves up and down."],["Drawdown","The decline from a peak to a trough in value."],["Risk tolerance","How much volatility an investor can emotionally handle."],["Risk capacity","How much loss an investor can financially afford."]],
 quiz:[
  ["Which usually has the highest expected long-term return and the highest volatility?",["Shares","Bank deposits","Short-term government bills","Cash"],0,"Shares compensate investors for higher risk with higher expected returns."],
  ["What is a drawdown?",["A fall from a previous peak value","A type of loan","A dividend payment","A fee"],0,"Drawdown measures how far an investment fell from its high."],
  ["Why does a long time horizon allow more risk?",["There’s more time to recover from temporary falls","Markets never fall over long periods","Fees disappear","Returns become guaranteed"],0,"Longer horizons let investors wait out downturns rather than sell at lows."]
 ]},

{id:"asset-classes", unit:4, title:"The Main Asset Classes", intro:"The building blocks of every portfolio.",
 body:[
  "Cash and equivalents (deposits, money-market funds) are stable and liquid, with low long-term returns. Bonds and sukuk are loans to, or asset-backed financing for, governments and companies; they pay regular income and are usually less volatile than shares.",
  "Shares (equities) are ownership stakes in companies. They offer the highest expected long-term growth among common assets, along with the most volatility. Real estate can provide rent and growth, directly or through REITs, but direct property is illiquid and concentrated.",
  "Commodities like gold don’t produce income; investors hold them for diversification or as a store of value. Crypto-assets are highly volatile and speculative; if held at all, most guidance suggests only a small amount you could afford to lose entirely."
 ],
 points:["Cash: stable, low return.","Bonds/sukuk: income, moderate risk.","Shares: highest expected growth, highest volatility.","Real estate: income and growth, often illiquid.","Gold/crypto: no income; diversifier or speculation."],
 example:"A balanced portfolio might hold global shares for growth, sukuk or bonds for stability, and cash for near-term needs, with only a small allocation (if any) to gold or speculative assets.",
 myth:"Myth: “Property never loses value.” Reality: property prices can fall, and direct property ties up a lot of money in one illiquid asset with ongoing costs.",
 try:"List what you currently own by asset class (cash, sukuk/bonds, shares, property, gold, other) and the rough percentage of each.",
 deeper:["Each class responds differently to economic conditions: shares often do well in growth, high-quality bonds may cushion recessions, and gold sometimes holds up in crises. That difference is what makes combining them useful.","Your home is a place to live first; counting it as part of your investment portfolio can give a misleading picture of diversification."],
 terms:[["Asset class","A group of investments with similar characteristics, such as shares or bonds."],["Equity (share)","An ownership stake in a company."],["Bond","A loan to a government or company that pays interest and returns principal."],["Sukuk","Sharia-compliant certificates representing ownership in assets or projects."],["Commodity","A raw material or primary product, such as gold or oil."]],
 quiz:[
  ["Which asset class represents ownership in companies?",["Shares (equities)","Bonds","Cash","Gold"],0,"Owning shares means owning part of a business."],
  ["What is a key drawback of direct property investment?",["It is illiquid and concentrated","It always loses money","It pays no rent","It can’t be sold"],0,"Selling property takes time and costs money, and one property is a concentrated bet."],
  ["What is the main reason to hold gold?",["Diversification or store of value; it pays no income","Guaranteed high income","It never changes price","It replaces an emergency fund"],0,"Gold has no cash flows; it is held for its different behaviour from other assets."]
 ]},

{id:"diversification", unit:4, title:"Diversification", intro:"Don’t let one mistake sink the ship.",
 body:[
  "Diversification means spreading money across many investments so that a problem with any one of them doesn’t ruin your plan. Individual companies can fail; whole sectors and countries can struggle for years.",
  "Real diversification comes from holdings that don’t all move together: different companies, sectors, countries and asset classes. Ten stocks in the same industry and country are not well diversified.",
  "Low-cost index funds provide instant diversification, holding hundreds or thousands of companies in one product. Watch out for home bias, putting most money in your own country’s market, and for concentration in your employer’s shares, which ties your job and your savings to the same risk."
 ],
 points:["Spread across companies, sectors, countries and asset classes.","Holdings that move together don’t diversify.","Index funds diversify cheaply.","Avoid heavy home bias and employer-stock concentration."],
 example:"An investor with all savings in two local bank shares could lose a large share of wealth in a banking downturn. A global equity index fund plus sukuk spreads that risk across thousands of issuers.",
 myth:"Myth: “Diversification limits my upside.” Reality: it removes the risk of catastrophic loss from one bet, the one risk you aren’t paid for taking.",
 try:"Look at your largest single investment. What share of your total investments is it? Over 10–20% in one company is high concentration.",
 deeper:["Correlation measures how investments move relative to each other. Combining assets with low correlation reduces portfolio volatility without necessarily lowering expected return as much.","In severe crises, many risky assets fall together; diversification reduces but doesn’t eliminate losses."],
 terms:[["Diversification","Spreading investments to reduce the impact of any single loss."],["Correlation","How closely two investments move together."],["Home bias","Over-investing in one’s own country’s market."],["Concentration risk","Risk from having too much in one investment, sector or country."]],
 quiz:[
  ["Which portfolio is most diversified?",["A global index fund plus a bond/sukuk fund","Three stocks in the same sector","All savings in your employer’s shares","One property"],0,"It spreads risk across thousands of companies, countries and two asset classes."],
  ["Why is holding many stocks from one sector not enough?",["They tend to move together","Sectors never fall","It’s illegal","It increases fees to zero"],0,"Common sector risks hit them all at once."],
  ["What risk do you take by holding lots of your employer’s shares?",["Your job and savings depend on the same company","None","Your salary rises automatically","Shares can’t fall"],0,"If the company struggles, you could lose income and savings together."]
 ]},

/* ───────── Unit 5 · How Markets Work ───────── */
{id:"stocks", unit:5, title:"How Stocks Work", intro:"Owning a slice of a business.",
 body:[
  "A share is a small ownership stake in a company. Shareholders benefit when the company grows its profits: the share price may rise, and the company may pay part of its profits as dividends.",
  "Share prices move with supply and demand, which reflect expectations about future profits, interest rates, the economy and investor sentiment. Short-term moves are noisy and hard to predict; long-term returns are driven mainly by earnings growth and dividends.",
  "Shares trade on stock exchanges through licensed brokers. In Saudi Arabia, the Saudi Exchange (Tadawul) lists local companies, with the TASI as its main index, and the Capital Market Authority regulates the market."
 ],
 points:["A share = part-ownership of a company.","Returns come from price growth and dividends.","Short-term prices are noisy; long-term follows earnings.","Saudi Exchange (Tadawul); main index TASI; regulator CMA."],
 example:"If a company earns more each year and pays a rising dividend, long-term shareholders benefit even if the price swings widely from month to month.",
 myth:"Myth: “A low share price means a stock is cheap.” Reality: price per share alone says nothing about value. A SAR 10 share can be expensive and a SAR 500 share cheap, relative to earnings.",
 try:"Pick one listed company you know. Find its share price, its annual earnings per share and its dividend, and note what the business actually does.",
 deeper:["An index tracks a group of shares to represent a market, such as TASI for Saudi Arabia or the S&P 500 for large US companies.","Sharia-compliant investors use screening (excluding prohibited activities and companies with high debt or interest income), and many index providers publish sharia-compliant versions of indices."],
 terms:[["Share (stock)","A unit of ownership in a company."],["Dividend","A distribution of company profits to shareholders."],["Stock exchange","A regulated market where shares are bought and sold."],["Index","A measure tracking the performance of a group of securities."],["Tadawul","The Saudi Exchange, where Saudi shares are listed and traded."]],
 quiz:[
  ["What does owning a share mean?",["Owning part of a company","Lending money to a company","Having a bank deposit","Buying insurance"],0,"Shares are ownership; bonds are loans."],
  ["What mainly drives long-term share returns?",["Company earnings growth and dividends","Daily news headlines","The share’s price per unit","The colour of the company logo"],0,"Over long periods, business results dominate."],
  ["What is TASI?",["The main index of the Saudi Exchange","A tax","A bank","A type of sukuk"],0,"The Tadawul All Share Index tracks the Saudi stock market."]
 ]},

{id:"bonds-sukuk", unit:5, title:"Bonds & Sukuk", intro:"Steady income, and why prices move with rates.",
 body:[
  "A bond is a loan to a government or company. The issuer pays periodic interest (the coupon) and repays the face value at maturity. Sukuk are the sharia-compliant counterpart: certificates representing ownership in underlying assets or projects, with returns coming from those assets rather than interest.",
  "Bond prices move opposite to interest rates. When rates rise, existing bonds with lower coupons become less attractive, so their prices fall; when rates fall, prices rise. The longer the time to maturity (duration), the bigger the price swing.",
  "Credit risk is the chance the issuer doesn’t pay. Governments with strong finances are lower risk; lower-rated companies pay higher yields to compensate. In a portfolio, high-quality bonds and sukuk usually add income and stability."
 ],
 points:["Bonds = loans; sukuk = asset-based, sharia-compliant certificates.","Rates up → existing bond prices down (and vice versa).","Longer duration = more price sensitivity.","Higher yield usually means higher credit risk."],
 example:"A 10-year bond paying 3% falls in price when new 10-year bonds start paying 5%, because buyers can get more income elsewhere.",
 myth:"Myth: “Bonds can’t lose money.” Reality: bond prices fall when rates rise, and issuers can default. Short, high-quality bonds are steadier, not riskless.",
 try:"Look up the yield on a Saudi government sukuk or another government bond. Compare it with a savings-account rate and note the difference in risk.",
 deeper:["Yield to maturity is the total annual return if you buy at today’s price and hold until maturity, receiving all payments.","Common sukuk structures include ijara (leasing), murabaha (cost-plus sale) and mudaraba or musharaka (partnership)."],
 terms:[["Coupon","The regular payment a bond makes to its holder."],["Maturity","The date the bond’s face value is repaid."],["Yield","The income return on a bond, given its price."],["Duration","A measure of a bond’s sensitivity to interest-rate changes."],["Credit risk","The risk that an issuer fails to pay as promised."]],
 quiz:[
  ["If interest rates rise, existing fixed-rate bond prices usually…",["Fall","Rise","Stay the same","Double"],0,"Higher new rates make older lower-coupon bonds less valuable."],
  ["How do sukuk differ from conventional bonds?",["They represent ownership in assets, with returns from those assets, not interest","They have no maturity","They always pay more","They are shares"],0,"Sukuk are structured to avoid riba."],
  ["Why do lower-rated issuers pay higher yields?",["To compensate investors for higher credit risk","Because they are bigger","Because rates are always higher for them by law","They don’t"],0,"Investors demand more return for a higher chance of default."]
 ]},

{id:"funds-etfs", unit:5, title:"Funds, Index Funds, ETFs & REITs", intro:"Buying a whole basket at once.",
 body:[
  "A fund pools money from many investors to buy a portfolio managed according to a stated strategy. Mutual funds are bought and sold at the end-of-day price. Exchange-traded funds (ETFs) trade on an exchange throughout the day like shares.",
  "Index funds (as mutual funds or ETFs) simply track an index, such as a global equity index, instead of trying to beat it. Because they don’t need expensive research teams, they usually have very low fees, and they are widely diversified.",
  "REITs (real estate investment trusts) own or finance income-producing property and distribute most of their income. They give property exposure with small amounts and daily liquidity, but their prices can be volatile."
 ],
 points:["Funds pool money into diversified portfolios.","ETFs trade all day; mutual funds price once a day.","Index funds track a market cheaply.","REITs offer listed exposure to income-producing property."],
 example:"With one global index ETF, an investor can own small stakes in thousands of companies across dozens of countries for a fee of around 0.1–0.3% a year.",
 myth:"Myth: “ETFs are riskier than mutual funds.” Reality: the wrapper doesn’t determine risk; what the fund holds does. A global equity ETF and a global equity mutual fund carry similar market risk.",
 try:"Find one index fund or ETF available to you. Note what index it tracks, its annual fee (expense ratio) and how many holdings it has.",
 deeper:["Check a fund’s factsheet: objective, benchmark, top holdings, fees, size and track record versus the benchmark.","Sharia-compliant index funds and ETFs exist that track screened indices."],
 terms:[["Mutual fund","A pooled investment priced once a day at net asset value."],["ETF","Exchange-traded fund: a fund that trades on an exchange like a share."],["Index fund","A fund designed to track a market index."],["REIT","Real estate investment trust: a listed vehicle owning income-producing property."],["Expense ratio","The annual fee a fund charges, as a percentage of assets."]],
 quiz:[
  ["What does an index fund aim to do?",["Track a market index","Beat the market every year","Pick a few winning stocks","Guarantee returns"],0,"Index funds match the market rather than trying to outperform it."],
  ["What distinguishes an ETF from a traditional mutual fund?",["It trades on an exchange throughout the day","It holds only one stock","It has no fees","It can’t be sold"],0,"ETFs are listed and trade like shares."],
  ["REITs mainly provide exposure to…",["Income-producing real estate","Government bonds","Gold","Startups"],0,"They own or finance property and pay out most of the income."]
 ]},

{id:"fees", unit:5, title:"Fees: The Silent Return Killer", intro:"Small percentages, huge sums.",
 body:[
  "Investment costs include fund expense ratios, platform or custody fees, trading commissions, entry and exit charges, and advice fees. They are taken every year whether returns are good or bad.",
  "Because fees compound, small differences grow large. SAR 100,000 growing at 7% a year for 30 years becomes about SAR 761,000. With a 1% annual fee it becomes about SAR 574,000; with 0.1%, about SAR 740,000. The 1% fee costs roughly a quarter of the final value.",
  "You can’t control markets, but you can control costs. Prefer low-cost diversified funds, avoid frequent trading, read the fee section of any product, and make sure advice fees buy real value."
 ],
 points:["Fees are charged every year, in good and bad markets.","Fee differences compound over decades.","1% a year can cost ~25% of final wealth over 30 years.","Costs are one of the few things you control."],
 example:"Over 30 years, SAR 100,000 at 7%: no fee → ~761,000; 0.1% fee → ~740,000; 1% fee → ~574,000.",
 myth:"Myth: “Higher fees mean better management.” Reality: research repeatedly finds that higher-cost funds, on average, deliver lower net returns.",
 try:"Find the total annual fees on any investment or pension product you hold. Estimate what they cost you per year in riyals.",
 deeper:["Look for the total cost: a fund’s expense ratio plus platform fees plus any advice fee. Three small fees can add up to a large one.","Frequent trading adds commissions and bid–ask spreads, and often leads to worse timing decisions too."],
 terms:[["Management fee","The fee paid to a fund manager, usually a yearly percentage."],["Commission","A fee for executing a trade."],["Bid–ask spread","The gap between buying and selling prices of a security."],["Total cost of ownership","All fees and costs of holding an investment."]],
 quiz:[
  ["Why do small annual fees matter so much?",["They compound over time, reducing growth every year","They are charged only once","They only apply in good years","They don’t matter"],0,"Each year’s fee also removes the future growth that money would have earned."],
  ["Over 30 years, a 1% annual fee on a 7% return reduces final wealth by roughly…",["A quarter","1%","Half","Nothing"],0,"About SAR 761,000 vs 574,000: roughly 25% less."],
  ["Which is a cost you can control?",["The fees you pay","Market returns","Interest-rate decisions","Inflation"],0,"Choosing low-cost products is fully within your control."]
 ]},

{id:"valuation-basics", unit:5, title:"Valuation Basics: P/E & Yield", intro:"Is a company expensive or cheap?",
 body:[
  "Valuation ratios compare a company’s price with what it earns or pays. The price-to-earnings ratio (P/E) is the share price divided by earnings per share. A P/E of 20 means investors pay SAR 20 for each SAR 1 of annual profit.",
  "A high P/E can mean investors expect strong growth, or that the shares are overpriced. A low P/E can mean a bargain, or a business in trouble. Compare P/Es within the same industry and alongside growth, debt and quality.",
  "Dividend yield is the annual dividend divided by the share price. A very high yield can signal a price that has fallen because the dividend may be cut. For most long-term investors, buying the whole market through an index fund avoids the need to value individual companies at all."
 ],
 points:["P/E = price ÷ earnings per share.","High P/E: growth expectations or overvaluation.","Compare valuations within the same industry.","Very high dividend yields can be warning signs."],
 example:"A share at SAR 60 with earnings per share of SAR 3 has a P/E of 20. If it pays a SAR 1.80 dividend, the dividend yield is 3%.",
 myth:"Myth: “Low P/E stocks always outperform.” Reality: cheap can stay cheap or get cheaper if the business is deteriorating. Valuation is one input, not a rule.",
 try:"For one listed company, calculate its P/E and dividend yield from its price, earnings per share and dividend. Compare it with a competitor.",
 deeper:["Other common ratios: price-to-book (P/B) for banks and asset-heavy firms, EV/EBITDA for comparing companies with different debt levels, and free-cash-flow yield.","A whole market’s P/E can also be compared with its own history to judge whether the market looks expensive, although this is a weak short-term timing signal."],
 terms:[["P/E ratio","Share price divided by earnings per share."],["Earnings per share (EPS)","Company profit divided by the number of shares."],["Dividend yield","Annual dividend divided by share price."],["Valuation","Estimating what an asset is worth."]],
 quiz:[
  ["A share costs SAR 50 and earns SAR 5 per share. Its P/E is…",["10","5","50","250"],0,"50 ÷ 5 = 10."],
  ["A very high dividend yield can be a warning because…",["The price may have fallen on fears the dividend will be cut","High yields are illegal","It means no risk","Yields never change"],0,"Yield rises when the price falls, often for a reason."],
  ["What is the simplest way to avoid valuing individual companies?",["Invest in a broad index fund","Buy the lowest-priced shares","Follow social-media tips","Trade daily"],0,"An index fund owns the whole market at its market valuation."]
 ]},

/* ───────── Unit 6 · Strategy & Behaviour ───────── */
{id:"passive-vs-active", unit:6, title:"Passive vs Active Investing", intro:"What the evidence says about beating the market.",
 body:[
  "Active investing tries to beat the market through stock selection or timing. Passive investing buys and holds the whole market through index funds and accepts the market’s return at very low cost.",
  "Before costs, the average actively managed money must, by definition, roughly equal the market. After fees and trading costs, the average active fund trails it. S&P’s long-running SPIVA reports have repeatedly found that most active US large-cap funds underperform the S&P 500 over 10–15 years, and that past winners rarely keep winning.",
  "Some active managers do outperform, but identifying them in advance is very hard. For most people, a low-cost, diversified passive core is a strong default, with any active choices kept small and deliberate."
 ],
 points:["Active: try to beat the market. Passive: own the market cheaply.","After costs, the average active fund lags its index.","Most active funds underperform over 10–15 years (SPIVA).","A low-cost passive core is a strong default."],
 example:"Two investors put SAR 200,000 into the same market. One uses an index fund at 0.1%; the other a fund charging 1.5% that matches the market before fees. After 20 years, the index investor ends up with substantially more.",
 myth:"Myth: “Professionals always beat the market.” Reality: most professional funds fail to beat their benchmark over long periods once fees are included.",
 try:"For any active fund you own or have been offered, compare its 10-year return after fees with its benchmark index over the same period.",
 deeper:["This arithmetic of active management was set out by Nobel laureate William Sharpe: before costs, active investors as a group hold the market; after costs, they must lag it.","Market timing (jumping in and out) is especially hard; missing a handful of the best days in a decade can sharply reduce returns, and those days often come right after the worst ones."],
 terms:[["Active investing","Trying to outperform the market through selection or timing."],["Passive investing","Tracking a market index at low cost."],["Benchmark","An index used to measure a fund’s performance."],["SPIVA","S&P’s research comparing active funds with their benchmarks."],["Market timing","Trying to move in and out of markets ahead of price moves."]],
 quiz:[
  ["What do SPIVA reports generally find about active large-cap funds over 15 years?",["Most underperform their benchmark","Most outperform","Exactly half outperform","None exist"],0,"The large majority lag their index after fees."],
  ["Why does the average active fund trail the market?",["Higher fees and trading costs","Markets are rigged","Index funds cheat","It doesn’t"],0,"Before costs active investors average the market; costs push them below it."],
  ["What is a sensible default for most long-term investors?",["A low-cost, diversified index-fund core","Picking a few hot stocks","Trading daily","Holding only cash"],0,"Low cost and broad diversification are hard to beat."]
 ]},

{id:"dca-lump-sum", unit:6, title:"Regular Investing vs Lump Sums", intro:"Consistency beats timing.",
 body:[
  "Regular investing (dollar-cost or riyal-cost averaging) means investing a fixed amount at regular intervals, such as monthly from your salary. You automatically buy more units when prices are low and fewer when high, and you remove the temptation to time the market.",
  "If you already have a lump sum, history shows that investing it all at once has usually produced higher returns than spreading it out, because markets rise more often than they fall. But spreading it over several months can reduce regret and make it easier to stay invested.",
  "For most people the real decision is simpler: invest automatically every month and keep going through good and bad markets. Consistency matters more than perfect entry points."
 ],
 points:["Regular monthly investing builds a habit and smooths entry prices.","Lump sums invested at once have historically done better on average.","Spreading a lump sum can reduce regret.","Automation and consistency matter most."],
 example:"Investing SAR 1,500 monthly: when the fund’s price is SAR 10 you buy 150 units; when it drops to SAR 7.50 you buy 200 units. Falls become buying opportunities instead of reasons to stop.",
 myth:"Myth: “I should wait for the market to drop before starting.” Reality: nobody reliably knows when drops will come. Waiting often means missing gains.",
 try:"Set up (or plan) an automatic monthly investment on the day after payday, for an amount your budget can sustain through a downturn.",
 deeper:["Studies comparing lump-sum investing with averaging (for example, research by Vanguard) found lump sums outperformed in roughly two-thirds of historical periods, mainly because markets tend to rise over time.","Keep investing during downturns. Stopping contributions when prices fall is the opposite of buying low."],
 terms:[["Cost averaging","Investing fixed amounts at regular intervals regardless of price."],["Lump sum","Investing a large amount all at once."],["Units","Shares of a fund, whose number depends on the price paid."]],
 quiz:[
  ["What is a main benefit of investing a fixed amount monthly?",["It builds a habit and buys more units when prices are low","It guarantees profits","It avoids all risk","It beats lump sums every time"],0,"Automatic regular investing removes timing decisions."],
  ["Historically, investing a lump sum at once has usually…",["Done better on average than spreading it out","Always lost money","Been illegal","Matched cash returns"],0,"Markets rise more often than not, so earlier investment tends to win, on average."],
  ["What should you do with monthly investing when markets fall?",["Keep going: you’re buying at lower prices","Stop immediately","Sell everything","Switch to crypto"],0,"Continuing through downturns is what makes averaging work."]
 ]},

{id:"asset-allocation", unit:6, title:"Asset Allocation & Rebalancing", intro:"The decision that drives most of your results.",
 body:[
  "Asset allocation is how you divide money between asset classes, mainly shares, bonds/sukuk and cash. It is the biggest driver of a diversified portfolio’s risk and long-term return, more than which individual fund you pick.",
  "A higher share allocation means more growth potential and bigger swings; more bonds and cash mean a smoother ride and lower expected return. Common starting points tie the allocation to your time horizon and risk tolerance, for example 80/20 shares/bonds for a long horizon and more conservative mixes as goals approach.",
  "Rebalancing brings the portfolio back to its target after markets move it. If shares surge from 60% to 72%, you sell some shares and buy bonds. This keeps risk under control and systematically sells high and buys low. Rebalance once a year, or when an allocation drifts beyond a set band."
 ],
 points:["Allocation (shares/bonds/cash) drives most risk and return.","Match the mix to time horizon and tolerance.","Rebalance yearly or when drift exceeds a band.","Rebalancing sells what rose and buys what fell."],
 example:"Target 70/30. After a strong year it is 78/22. Rebalancing sells 8% of shares and buys sukuk to restore 70/30.",
 myth:"Myth: “Rebalancing means selling my winners, which is a mistake.” Reality: it keeps your risk at the level you chose; without it, a portfolio drifts riskier precisely when markets are high.",
 try:"Decide a target allocation for your long-term money (e.g. 80/20 or 60/40), then compare it with what you actually hold.",
 deeper:["Target-date or lifecycle funds automatically shift from shares to bonds as a target year approaches, handling allocation and rebalancing for you.","Use new contributions to rebalance where possible: direct new money to the underweight asset to avoid selling."],
 terms:[["Asset allocation","How a portfolio is divided among asset classes."],["Rebalancing","Restoring a portfolio to its target allocation."],["Drift","How far a portfolio has moved from its target mix."],["Target-date fund","A fund that becomes more conservative as a target year approaches."]],
 quiz:[
  ["What drives most of a diversified portfolio’s risk and return?",["Its asset allocation","The fund’s logo","The day of the week you buy","Its number of holdings only"],0,"The share/bond/cash mix dominates outcomes."],
  ["Your 60/40 portfolio is now 70/30. Rebalancing means…",["Selling some shares and buying bonds","Buying more shares","Doing nothing","Moving all to cash"],0,"Rebalancing restores the target mix."],
  ["What does a target-date fund do?",["Shifts automatically to a more conservative mix over time","Guarantees a return on a date","Holds only cash","Trades daily for profit"],0,"It manages allocation along a glide path towards the target year."]
 ]},

{id:"behavioural-biases", unit:6, title:"Behavioural Biases", intro:"Your biggest investing risk may be you.",
 body:[
  "Behavioural finance studies the mental shortcuts that lead investors astray. Loss aversion: losses feel roughly twice as painful as equal gains feel good, so people panic-sell in crashes or cling to losers. Herding: following the crowd into what’s popular, often near the top.",
  "Recency bias: assuming recent trends will continue. Overconfidence: overestimating your ability to pick winners or time markets, which leads to over-trading. Anchoring: fixating on a reference number, such as the price you paid. Confirmation bias: seeking only information that supports what you already believe.",
  "Defences are mostly structural: a written plan, automatic investing, a fixed allocation with scheduled rebalancing, fewer checks of your portfolio, and a rule to wait before acting on strong emotions."
 ],
 points:["Loss aversion, herding, recency, overconfidence, anchoring, confirmation.","Biases cause buying high and selling low.","Defend with plans, automation and rules.","Check your portfolio less often."],
 example:"After a 40% gain in a popular sector, an investor moves everything in (recency and herding). A correction follows, and she sells after a 30% fall (loss aversion), locking in the loss.",
 myth:"Myth: “I’m rational, so biases don’t affect me.” Reality: everyone has them, including professionals. Systems, not willpower, protect against them.",
 try:"Write a one-page investment policy for yourself: goals, target allocation, monthly amount, rebalancing rule, and what you will do in a 30% crash.",
 deeper:["Research on individual investors (for example, studies by Barber and Odean) found that those who traded most earned lower net returns, consistent with overconfidence.","Investor returns often trail fund returns because people buy after gains and sell after losses. The behaviour gap can be larger than the fee gap."],
 terms:[["Loss aversion","Feeling losses more intensely than equivalent gains."],["Herding","Following what others are doing rather than independent analysis."],["Recency bias","Over-weighting recent events when predicting the future."],["Overconfidence","Overestimating one’s knowledge or ability."],["Anchoring","Relying too heavily on a reference point, such as the purchase price."]],
 quiz:[
  ["Refusing to sell a stock until it returns to your purchase price is an example of…",["Anchoring","Diversification","Rebalancing","Compounding"],0,"The purchase price is irrelevant to future prospects."],
  ["Buying a sector because ‘everyone is making money in it’ reflects…",["Herding","Loss aversion","Risk capacity","Duration"],0,"Following the crowd often means buying late, at high prices."],
  ["Which defence works best against biases?",["A written plan with automatic investing and rebalancing rules","Checking prices hourly","Following social media tips","Relying on willpower"],0,"Structure removes in-the-moment emotional decisions."]
 ]},

{id:"speculation-risks", unit:6, title:"Speculation, Leverage & Crypto", intro:"Know the difference between investing and betting.",
 body:[
  "Speculation is trying to profit from short-term price movements rather than the long-term value of productive assets. It includes day-trading, chasing tips, most short-term options trading and many crypto-asset strategies.",
  "Leverage (borrowing to invest, margin, or leveraged products) magnifies gains and losses. A 50% fall in a 2× leveraged position wipes out the investment, and margin calls can force you to sell at the worst time. Derivatives like options and CFDs can lose money very quickly; regulators often warn that most retail CFD accounts lose money.",
  "Crypto-assets are extremely volatile, have suffered falls of more than 70%, and include many failed or fraudulent projects and platforms. If you choose to hold any, use only money you could afford to lose entirely, keep it a small share of your wealth, and use regulated platforms where available."
 ],
 points:["Speculation bets on short-term moves.","Leverage magnifies losses and can force selling.","Options, CFDs and day-trading lose most retail traders money.","Crypto: highly volatile; only money you can afford to lose."],
 example:"An investor buys SAR 100,000 of shares using SAR 50,000 of their own and SAR 50,000 borrowed. A 30% fall leaves shares worth SAR 70,000; after repaying the loan, only SAR 20,000 remains: a 60% loss of their own money.",
 myth:"Myth: “Day-trading is a reliable way to earn extra income.” Reality: studies of retail day-traders consistently find most lose money over time after costs.",
 try:"If you hold any speculative positions, calculate what share of your total net worth they are, and what happens to you if they go to zero.",
 deeper:["In Saudi Arabia, check whether a platform is licensed by the CMA before trading securities or derivatives; many online trading offers are unlicensed.","Many scholars consider some speculative instruments impermissible; sharia-conscious investors should seek qualified guidance."],
 terms:[["Speculation","Seeking profit from short-term price changes."],["Leverage","Using borrowed money to increase exposure."],["Margin call","A demand to add funds or sell when a leveraged position falls."],["Derivative","A contract whose value depends on another asset, such as an option."],["CFD","Contract for difference: a leveraged derivative betting on price changes."]],
 quiz:[
  ["With 2× leverage, a 50% fall in the asset means your own money falls by about…",["100%","50%","25%","0%"],0,"Leverage doubles the loss: 2 × 50% = 100%."],
  ["What do studies generally find about retail day-traders?",["Most lose money over time after costs","Most get rich","Exactly half profit","They never trade"],0,"Costs, competition and biases work against short-term traders."],
  ["A sensible rule for speculative assets like crypto is…",["Only invest money you could afford to lose entirely","Put your emergency fund in","Borrow to buy more","Make it most of your portfolio"],0,"Keep speculative exposure small and affordable."]
 ]},

/* ───────── Unit 7 · Planning Your Financial Life ───────── */
{id:"financial-goals", unit:7, title:"Setting Financial Goals", intro:"Turn wishes into numbers and dates.",
 body:[
  "A financial goal needs three things: an amount, a date and a plan. ‘Save for a house’ becomes ‘SAR 150,000 deposit in 5 years, saving SAR 2,300 a month into a conservative portfolio’.",
  "Group goals by horizon. Short-term (under 3 years): emergency fund, car, wedding, keep these in savings. Medium-term (3–5 years): home deposit, education, use a cautious mix. Long-term (5+ years): retirement, children’s future, invest for growth.",
  "Prioritise: emergency fund and high-interest debt first, then long-term retirement saving alongside other goals. Review goals yearly and after life events such as marriage, children or a job change."
 ],
 points:["Goals need an amount, a date and a monthly plan.","Match investments to each goal’s horizon.","Emergency fund and expensive debt come first.","Review yearly and after life changes."],
 example:"Goal: SAR 60,000 car in 3 years without financing. Monthly saving ≈ 60,000 ÷ 36 ≈ SAR 1,667, kept in a savings or money-market account.",
 myth:"Myth: “I’ll figure out goals later; for now I just save what’s left.” Reality: what’s left is usually little or nothing. Named goals with automatic transfers get funded.",
 try:"Write down three goals with an amount and a date. Divide each amount by the number of months to get a monthly saving target.",
 deeper:["When investing for a goal, the required monthly saving depends on the expected return; higher-risk portfolios may need less saving on average but carry more chance of falling short.","Separate accounts or ‘pots’ per goal make progress visible and protect money from being spent on something else."],
 terms:[["Financial goal","A target amount for a purpose by a specific date."],["Sinking fund","Money set aside regularly for a known future expense."],["Life event","A major change, such as marriage or a new child, that should trigger a plan review."]],
 quiz:[
  ["What turns a wish into a financial goal?",["An amount, a date and a plan","Hoping it happens","Telling friends","Opening a social-media account"],0,"Specific numbers make the goal actionable."],
  ["Where should money for a goal 2 years away usually be kept?",["Low-risk savings","Aggressive share funds","Crypto","A single stock"],0,"Short horizons can’t ride out market falls."],
  ["Which usually comes first?",["Emergency fund and paying off high-interest debt","A luxury holiday fund","Speculative trading","Buying a second car"],0,"These protect everything else in the plan."]
 ]},

{id:"retirement", unit:7, title:"Planning for Retirement", intro:"The longest-term goal, and the one most worth starting early.",
 body:[
  "Retirement planning starts with an estimate of the income you will need. A common rule of thumb is 70–80% of your pre-retirement income, adjusted for expected costs such as housing and healthcare.",
  "Then subtract guaranteed income such as a state or employer pension. In Saudi Arabia, the General Organization for Social Insurance (GOSI) provides pensions for eligible contributors. The gap must come from your own savings and investments.",
  "The ‘4% rule’ is a rough guide from US historical research (Bengen, 1994): withdrawing about 4% of a balanced portfolio in the first year and adjusting for inflation has historically lasted about 30 years. So SAR 120,000 a year needs roughly SAR 3 million. Treat it as a starting point, not a guarantee; longer retirements or different markets may need a lower rate."
 ],
 points:["Estimate needed income (often 70–80% of pre-retirement).","Subtract pensions (e.g. GOSI) to find the gap.","4% rule: portfolio ≈ annual need × 25 (rough guide).","Start early; compounding does most of the work."],
 example:"Need SAR 180,000 a year; expected pension SAR 60,000. Gap SAR 120,000 → target portfolio ≈ 120,000 × 25 = SAR 3,000,000.",
 myth:"Myth: “My pension will cover everything.” Reality: pensions often replace only part of earnings. Check your expected pension and plan for the gap.",
 try:"Estimate your yearly spending in retirement, subtract any expected pension, and multiply the gap by 25 to get a rough target.",
 deeper:["Sequence-of-returns risk: poor market returns in the first years of retirement hurt more than the same returns later, because withdrawals lock in losses. Holding a cash or bond buffer helps.","End-of-service benefits can be a meaningful lump sum at retirement; decide in advance how much will be invested rather than spent."],
 terms:[["Replacement rate","Retirement income as a share of pre-retirement income."],["4% rule","A guideline to withdraw about 4% of a portfolio in the first year of retirement."],["Sequence-of-returns risk","The danger of poor returns early in retirement while withdrawing."],["GOSI","Saudi Arabia’s General Organization for Social Insurance, which provides pensions."]],
 quiz:[
  ["Using the 4% rule, how big a portfolio supports SAR 80,000 a year?",["About SAR 2 million","About SAR 320,000","About SAR 8 million","About SAR 800,000"],0,"80,000 × 25 = 2,000,000."],
  ["What is sequence-of-returns risk?",["Poor returns early in retirement doing outsized damage","A type of loan","A pension fee","Inflation in childhood"],0,"Early losses combined with withdrawals shrink the base permanently."],
  ["Why is the 4% rule only a rough guide?",["It is based on US history and specific assumptions","It is illegal outside the US","It guarantees 4% returns","It ignores withdrawals"],0,"Different markets, costs and retirement lengths can require a lower rate."]
 ]},

{id:"islamic-finance", unit:7, title:"Islamic Finance Basics", intro:"Principles behind sharia-compliant products.",
 body:[
  "Islamic finance follows principles drawn from sharia. Key prohibitions include riba (interest), excessive uncertainty (gharar) and gambling-like speculation (maysir), as well as financing prohibited activities. Transactions are generally linked to real assets and shared risk.",
  "Common structures: murabaha (the bank buys an asset and sells it to you at an agreed cost plus profit, paid in instalments); ijara (leasing); musharaka and mudaraba (partnerships sharing profit and loss); tawarruq (used for cash financing, and debated among scholars); and sukuk (asset-based investment certificates).",
  "For investing, sharia-compliant funds screen companies by business activity and financial ratios, such as limits on debt and interest income. Zakat is commonly calculated at 2.5% on qualifying wealth above the nisab held for a full lunar year. Details vary by school and situation, so consult a qualified scholar."
 ],
 points:["Avoids riba, gharar, maysir and prohibited activities.","Murabaha, ijara, musharaka/mudaraba, tawarruq, sukuk.","Sharia screening filters stocks by activity and ratios.","Zakat ≈ 2.5% of qualifying wealth above nisab after a lunar year."],
 example:"With murabaha car financing, the bank buys the car and sells it to you for SAR 110,000, payable over 4 years. The profit is fixed at the start, and you can compare the cost using the APR.",
 myth:"Myth: “Islamic financing is always cheaper than conventional.” Reality: costs vary by product and provider. Compare the APR and total cost like any other financing.",
 try:"Check whether your savings, financing or investments are sharia-compliant, and find which board or standard certifies them.",
 deeper:["The nisab is commonly set at the value of 85 grams of gold (or 595 grams of silver). In Saudi Arabia, ZATCA collects zakat from businesses; individuals typically calculate and pay their own.","Standards bodies such as AAOIFI publish sharia standards widely used across the industry."],
 terms:[["Riba","Interest or usury, prohibited in Islamic finance."],["Murabaha","A cost-plus sale used for financing, with the profit agreed upfront."],["Ijara","An Islamic leasing contract."],["Zakat","An obligatory charitable payment, commonly 2.5% of qualifying wealth above the nisab."],["Nisab","The minimum wealth threshold above which zakat is due."]],
 quiz:[
  ["Which is prohibited in Islamic finance?",["Riba (interest)","Trade","Leasing","Partnership"],0,"Riba is the central prohibition; trade, leasing and partnership are permitted structures."],
  ["How does murabaha financing work?",["The financier buys the asset and sells it to you at cost plus an agreed profit","You borrow cash at a variable interest rate","You rent a car forever","You buy shares in the bank"],0,"It is a sale with a disclosed mark-up, often paid in instalments."],
  ["Zakat on qualifying savings is commonly…",["2.5% above the nisab after a lunar year","15% each month","Optional at any rate","50%"],0,"2.5% is the widely applied rate on zakatable wealth."]
 ]},

{id:"financial-plan-capstone", unit:7, title:"Capstone: Your Financial Plan", intro:"Put everything together on one page.",
 body:[
  "A personal financial plan brings the course together. 1) Know your numbers: income, spending, debts, net worth. 2) Budget with automatic saving. 3) Build an emergency fund. 4) Pay down high-interest debt. 5) Protect against major risks with insurance or takaful.",
  "6) Set goals with amounts and dates. 7) Choose an asset allocation for each horizon. 8) Invest regularly in low-cost, diversified funds that fit your values. 9) Rebalance yearly and keep fees low. 10) Write down how you will behave in a crash, and review the plan every year.",
  "Simple, written and automated beats complicated and forgotten. Most of the result comes from saving consistently, avoiding expensive debt, diversifying, keeping costs low and staying invested."
 ],
 points:["Numbers → budget → emergency fund → debt → protection.","Goals → allocation → low-cost investing → rebalancing.","Write your crash plan in advance.","Review yearly; keep it simple and automated."],
 example:"Plan summary: save 20% automatically on payday; emergency fund of 5 months; clear card debt by June; family takaful cover; 80/20 global equity/sukuk index funds for retirement; rebalance each January; no selling in downturns.",
 myth:"Myth: “Financial planning is only for the wealthy.” Reality: a plan matters most when money is tight, because there is less room for expensive mistakes.",
 try:"Write your own one-page plan using the ten steps. Leave nothing blank, even if the answer for now is ‘start with SAR 500 a month’.",
 deeper:["A licensed financial adviser can help with complex situations, but understand how they are paid: fee-only advice avoids commissions that create conflicts of interest.","Keep key documents organised (accounts, policies, a will or wasiyya) so your family can manage if something happens to you."],
 terms:[["Financial plan","A written plan covering budgeting, protection, goals and investing."],["Investment policy statement","A written set of rules for how you invest."],["Fee-only adviser","An adviser paid directly by clients rather than by product commissions."]],
 quiz:[
  ["Which step should come before investing for long-term growth?",["Emergency fund and clearing high-interest debt","Buying speculative assets","Leverage","Day-trading practice"],0,"Foundations protect your investments from being sold in an emergency."],
  ["Why write down how you’ll behave in a crash?",["Pre-commitment reduces panic decisions","It is required by law","It guarantees returns","It removes risk"],0,"Deciding calmly in advance protects you from emotional selling."],
  ["What drives most long-term investing success for individuals?",["Consistent saving, diversification, low costs and staying invested","Finding the next hot stock","Perfect market timing","Frequent trading"],0,"Simple, disciplined habits beat complicated strategies."]
 ]}
]
});
