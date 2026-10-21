import React, { useEffect } from "react";
import { SiteFooter } from "./PublicPages";

const CONTACT_EMAIL = "havok06481@gmail.com";
const SITE_URL = "https://forex-frame.vercel.app";

const articles = [
  {
    slug: "forex-market-structure",
    path: "/academy/forex-market-structure",
    title: "Forex Market Structure for Beginners",
    category: "Market Structure",
    description: "Learn how swing points, trends, ranges, and breaks of structure can help organize historical chart review without pretending to predict the future.",
    intro: "Market structure is a way of describing how price has been moving. It can give a chart review a shared vocabulary, but it is an interpretation of past price action—not a certainty about what comes next.",
    blocks: [
      { heading: "What market structure means", paragraphs: ["Market structure describes the relationship between meaningful highs and lows on a chart. Instead of treating every tick as equally important, a trader identifies turning points and asks whether price is generally making progress upward, progress downward, or moving between boundaries.", "The exact rules for choosing a meaningful swing vary. Some traders use a fixed number of candles, a minimum price distance, or a higher timeframe for context. Because the terminology differs between methodologies, structure should be defined consistently inside your own review process."] },
      { heading: "Swing highs, swing lows, and trends", paragraphs: ["A swing high is a local peak surrounded by lower prices on either side; a swing low is a local trough surrounded by higher prices on either side. These are descriptive labels, not guarantees that a reversal will follow.", "An upward sequence is commonly described as higher highs and higher lows. A downward sequence is commonly described as lower lows and lower highs. When price repeatedly respects a broad boundary instead of extending in one direction, the market may be described as ranging or consolidating."] },
      { heading: "Hypothetical examples", example: { title: "Hypothetical upward trend", text: "Suppose a pair forms a low at 1.0800, rallies to 1.0900, pulls back to 1.0850, and then rallies to 1.0980. The second low is higher than the first and the second high is higher than the first. A reviewer could label this sequence higher low → higher high and describe it as upward structure at that scale." } },
      { example: { title: "Hypothetical downward trend", text: "Suppose price falls from 1.2500 to 1.2380, rebounds to 1.2450, and then falls to 1.2300. The rebound is a lower high and the later low is a lower low. A reviewer could describe the sequence as downward structure, while still acknowledging that the next move is uncertain." } },
      { heading: "Breaks of structure and changed direction", paragraphs: ["A break of structure is a label used when price moves beyond a previously identified swing level. A move above a prior high may be called a bullish break; a move below a prior low may be called a bearish break. Some traders use related terms such as change of character or market-structure shift.", "A broken level does not guarantee continuation. The move may be a brief spike, a false break, a reaction to news, or the beginning of a range. A disciplined review records what was visible at the time instead of rewriting the chart after the outcome is known."] },
      { heading: "Common interpretation mistakes", bullets: ["Changing the swing-point definition from chart to chart so that the preferred narrative always looks correct.", "Treating every new high or low as equally important without considering timeframe and scale.", "Assuming a trend label is a trade signal or a prediction rather than a description.", "Ignoring ranges, volatility, news, and the possibility that different timeframes show different structures."] },
      { heading: "A practical chart-review exercise", paragraphs: ["Choose ten historical chart sections and hide the candles to the right of the review area. Mark the most recent swing high and swing low using one pre-defined rule. Label the visible sequence as upward, downward, or ranging, then record what would invalidate that label. Reveal the next section only after writing the observation. This reduces the temptation to use future information in the initial description."] },
    ],
  },
  {
    slug: "risk-management",
    path: "/academy/risk-management",
    title: "Risk Management Before Trade Entry",
    category: "Risk Management",
    description: "Understand planned risk, stop distance, position sizing, transaction costs, and why a favorable ratio alone cannot establish a profitable strategy.",
    intro: "Risk management starts before entry. It is the process of defining what could be lost, how a position is sized, and which assumptions could make the real result differ from the plan.",
    blocks: [
      { heading: "The basic trade plan", paragraphs: ["A trade plan commonly identifies an entry price, a stop-loss level that defines when the idea is considered wrong, and a take-profit level or exit condition. The distance between entry and stop is a price distance; it is not automatically the amount of money at risk.", "A risk-to-reward ratio compares the planned loss to the planned gain. For example, risking 100 monetary units to seek 200 gives a planned 1:2 ratio. The ratio is only an assumption about one setup; it does not describe the quality of the strategy by itself."] },
      { heading: "Position sizing as a concept", paragraphs: ["Position size connects stop distance to money risk. A simplified relationship is: position size = planned money risk ÷ (stop distance × value per price unit). The value per unit depends on the instrument, contract specification, quote currency, and size. For currency pairs, pip values can differ across pairs and account currencies.", "A wider stop with the same money-risk limit normally requires a smaller position. A narrower stop normally permits a larger position, but a stop that is too close may be more vulnerable to ordinary market noise. The calculation should be checked against the broker or venue specifications when trading outside a journal."] },
      { heading: "Hypothetical numerical example", example: { title: "Educational example only", text: "Assume an account of 10,000 units, a planned risk of 0.5% (50 units), and a stop distance whose value is estimated at 10 units per standard position. A simplified size estimate is 50 ÷ (20 × 10) = 0.25 standard positions. This is only an illustration: the actual pip value, contract size, currency conversion, and execution rules must be verified for the instrument." } },
      { heading: "Planned risk is not realized result", paragraphs: ["The planned risk is the loss assumed if the stop is filled under the plan. The realized result can differ because of spread, commission, slippage, gaps, partial fills, execution delay, or a manual exit. A stop-loss is a risk-control instruction, not an absolute guarantee of the exact exit price.", "Record the assumptions separately from the outcome. This makes it possible to review whether the plan was followed and whether the execution environment changed the result."] },
      { heading: "Common misconceptions", bullets: ["A 1:2 risk-to-reward ratio does not mean every two trades will produce one win and one loss.", "A high win rate does not make oversized losses safe.", "A fixed percentage is not universally appropriate for every person, account, or instrument.", "Ignoring costs can turn a small theoretical edge into a negative realized result.", "Increasing size after a loss is not automatically a recovery plan; it can increase exposure to a losing sequence."] },
      { heading: "Pre-entry questions", checklist: ["Where is the entry and what invalidates the idea?", "What is the planned money risk after including costs where possible?", "How was position size calculated for this instrument?", "What market condition would make the setup unsuitable?", "Can the trade be accepted without needing the target to be reached?"] },
    ],
  },
  {
    slug: "trading-journal",
    path: "/academy/trading-journal",
    title: "How to Keep a Useful Trading Journal",
    category: "Trading Journals",
    description: "Build a practical journal that captures decisions, context, execution, emotions, and lessons without turning one outcome into a sweeping conclusion.",
    intro: "A trading journal is a record of decisions and results. Its value comes from consistent, honest observations that can be compared across a group of trades—not from writing the longest note after every outcome.",
    blocks: [
      { heading: "Why journal at all?", paragraphs: ["Memory tends to compress a trade into its outcome. A written record preserves what was known before entry, what was intended, and what actually happened. That distinction helps separate a poor process from an ordinary losing outcome.", "A journal is most useful when its fields are consistent enough to compare. It should support review rather than become a second source of pressure or self-criticism."] },
      { heading: "Useful fields to record", paragraphs: ["Core fields often include date and time, instrument, direction, timeframe, entry, stop-loss, take-profit, position size, exit, outcome, and realized P/L. Context fields can include strategy, market condition, original entry reason, emotion, mistake, and lesson.", "The right level of detail depends on the review question. If you want to compare a strategy across timeframes, those fields need consistent labels. If you want to understand execution, record the planned and actual values separately where possible."] },
      { heading: "Hypothetical well-documented trade", example: { title: "Example record", text: "EUR/USD, H1, Buy. Plan: enter after a pullback to a previously marked level; stop below the invalidation swing; target at the next higher-timeframe resistance. Emotion before entry: calm but eager after missing an earlier move. Result: loss at the planned stop. Review: the entry followed the written setup, but the setup occurred directly before a scheduled high-impact event. Lesson: add an event check to the pre-trade checklist and review the next 20 comparable trades before changing the strategy." } },
      { heading: "Decision quality versus trade outcome", paragraphs: ["A good decision can lose and a poor decision can win. This is not an excuse to ignore results; it is a reminder that a single outcome is noisy. Review whether the entry, sizing, stop, and exit followed the process that was intended. Then study repeated observations across a meaningful sample.", "Avoid changing a method after one trade. Write the lesson as a testable observation, such as ‘When this setup occurs near a major scheduled event, compare results separately,’ rather than ‘This setup never works.’"] },
      { heading: "Common journaling mistakes", bullets: ["Recording only winning trades or only trades that feel unusual.", "Writing vague lessons such as ‘be disciplined’ without describing an observable behavior.", "Changing category names so that similar trades cannot be grouped later.", "Using the outcome to justify the original decision after the fact.", "Treating emotional notes as a character judgment instead of information about conditions and behavior."] },
      { heading: "Pre-trade and post-trade checklist", checklist: ["Pre-trade: Is the setup defined, and what would invalidate it?", "Pre-trade: Are risk, size, and planned exit conditions written down?", "Post-trade: Did execution match the plan?", "Post-trade: What was known before the result, and what is hindsight?", "Review: What group of trades should be examined before changing the process?"] },
      { heading: "How ForexFrame can support the process", paragraphs: ["ForexFrame provides trading-account organization, journal trade fields, calculated risk and P/L values, recent-trade review, equity curves, and analytics based on recorded trades. It does not connect to a broker or import live trades, so the quality of the review depends on the information entered by the user."] },
    ],
  },
  {
    slug: "trading-statistics",
    path: "/academy/trading-statistics",
    title: "How to Read Trading Statistics",
    category: "Performance Analysis",
    description: "Learn the meaning and limits of win rate, averages, profit factor, expectancy, net P/L, drawdown, and sample size.",
    intro: "Statistics summarize a collection of trades. They can reveal useful patterns, but each metric answers a different question and none can guarantee future performance.",
    blocks: [
      { heading: "Start with the dataset", paragraphs: ["Before interpreting a number, define which trades it includes: completed trades only, one instrument or several, one strategy or several, and which date range. Mixing different processes can produce an average that describes none of them.", "A statistic is also affected by sample size. Ten trades can be useful for checking whether records are complete, but they are usually too few to support confident conclusions about a strategy across changing conditions."] },
      { heading: "Core formulas", formula: "Win rate = winning trades ÷ total completed trades × 100%\nProfit factor = gross profits ÷ absolute value of gross losses\nExpectancy per trade = (win rate × average win) − (loss rate × average loss)\nNet P/L = gross profits − gross losses − applicable costs", paragraphs: ["For expectancy, win rate and loss rate are expressed as decimals, and average loss is treated as a positive loss magnitude in the formula. Profit factor is generally undefined or unavailable when gross losses are zero; a perfect-looking value in a tiny sample should not be treated as proof."] },
      { heading: "Win rate and average trade size", paragraphs: ["Win rate answers how often completed trades were winners under the selected definition. It does not say how large wins and losses were. Average winning trade and average losing trade add that missing scale.", "Hypothetical example: ten trades contain six wins averaging +50 and four losses averaging −90. Win rate is 60%, but the gross result is 300 − 360 = −60 before costs. A higher win rate did not prevent a loss because the losing trades were larger."] },
      { heading: "Profit factor and expectancy", paragraphs: ["In the same example, profit factor is 300 ÷ 360 = 0.83. A value above 1 means gross profits exceed gross losses for the selected sample, before considering how representative the sample is.", "Expectancy is an average model, not a forecast of the next trade. With a 0.60 win rate, a 50 average win, a 0.40 loss rate, and a 90 average loss, expectancy is (0.60 × 50) − (0.40 × 90) = −6 per trade before costs."] },
      { heading: "Drawdown, risk-to-reward, and net P/L", paragraphs: ["Net P/L shows the total change under the calculation’s assumptions. Maximum drawdown describes the largest decline from a prior equity peak to a later trough in the selected sequence. It helps describe the path, not just the endpoint.", "A planned risk-to-reward ratio describes a setup’s intended distances. It is different from the realized average win-to-average-loss relationship and should not be substituted for it. Drawdown and net P/L also depend on ordering: the same trades in a different sequence can have a different drawdown."] },
      { heading: "Compare metrics together", bullets: ["Use win rate with average win and average loss.", "Use profit factor with net P/L, costs, and the number of trades.", "Use expectancy with the exact sample definition and assumptions.", "Use drawdown with the recovery path and time period.", "Compare assets, timeframes, and market conditions separately when the process differs."] },
      { heading: "How ForexFrame presents statistics", paragraphs: ["ForexFrame calculates journal performance statistics from recorded trades, including win rate, P/L, profit factor, average R, streaks, and drawdown views. The result describes the selected journal records and calculation rules; it is not a live broker statement or a prediction."] },
    ],
  },
  {
    slug: "equity-curves",
    path: "/academy/equity-curves",
    title: "Understanding an Equity Curve",
    category: "Performance Analysis",
    description: "Read upward, downward, and sideways equity paths, recognize drawdowns and recovery periods, and interpret journal-based curves carefully.",
    intro: "An equity curve is a time-ordered view of account value or performance. It shows the path taken by a sequence of results, which can reveal information that a single total P/L number hides.",
    blocks: [
      { heading: "What an equity curve represents", paragraphs: ["A curve plots a value against time or trade sequence. An upward section means the plotted value increased over that section; a downward section means it decreased; and a sideways section means changes were small or offsetting.", "Balance usually refers to realized funds after closed results. Equity can include unrealized P/L from an open position, depending on the system. The labels are not interchangeable, so identify what the chart actually calculates before interpreting it."] },
      { heading: "Drawdowns and recovery", paragraphs: ["A drawdown begins when the curve falls below a previous peak. The recovery period lasts until the curve returns to that peak. Two strategies can finish at the same value while having very different drawdowns and recovery times.", "A smooth curve is not automatically reliable. It may reflect a short sample, rounded values, missing trades, favorable conditions, or a calculation that does not include costs and withdrawals. A jagged curve is not automatically bad either; volatility must be interpreted with the process and risk assumptions."] },
      { heading: "Simple text illustration", example: { title: "Hypothetical path", text: "Starting value 10,000 → 10,200 → 9,950 → 10,100. The peak of 10,200 is followed by a 250-unit decline to 9,950, then a partial recovery. The curve has not recovered the prior peak until it reaches 10,200 again. The endpoint alone would not show that path." } },
      { heading: "Deposits, withdrawals, and data boundaries", paragraphs: ["External deposits and withdrawals can create jumps that are not trading performance. If they are not represented separately, a curve may attribute an account-value change to trades incorrectly. Mark these events or analyze periods that exclude them when possible.", "Trade dates, missing records, duplicate records, and different starting balances also affect the path. A chart should be reviewed alongside the underlying rows and the exact date range."] },
      { heading: "How ForexFrame calculates its journal curve", paragraphs: ["ForexFrame builds the equity curve from recorded journal trades. It sorts trades chronologically, starts with the selected trading account’s starting balance, and adds each normalized recorded trade P/L to produce the next balance point. The curve therefore represents the application’s recorded journal history and calculation method—not live broker equity and not an account statement.", "The dashboard allows a selectable period such as 1, 7, 30, 90, 180, or 365 days. A shorter view can help focus on recent records, but it can also hide a longer drawdown or recovery period."] },
      { heading: "Use the curve with other evidence", bullets: ["Check total trades and the date range.", "Compare win rate, average wins and losses, profit factor, and drawdown.", "Review whether deposits, withdrawals, missing records, or strategy changes affect the path.", "Inspect the underlying trades rather than treating the line as a prediction.", "Ask whether the observed behavior persists across different market conditions."] },
    ],
  },
  {
    slug: "backtesting",
    path: "/academy/backtesting",
    title: "Backtesting: What It Can and Cannot Tell You",
    category: "Strategy Evaluation",
    description: "Understand historical testing, overfitting, look-ahead bias, data quality, costs, and why past results are not future performance.",
    intro: "Backtesting applies a defined strategy or hypothesis to historical data. It can make assumptions testable, but it cannot turn historical results into a guarantee about live trading.",
    blocks: [
      { heading: "Hypothesis versus evidence", paragraphs: ["A hypothesis is a claim that can be examined, such as ‘this entry condition may behave differently in a strong trend.’ A backtest applies a rule to a chosen dataset and records the outcomes under stated assumptions. The output is evidence about that test—not proof that the idea is true in every market.", "A useful test defines the instrument, timeframe, date range, entry and exit rules, position sizing, costs, and what counts as a valid trade before looking at results."] },
      { heading: "Sources of misleading results", bullets: ["Look-ahead bias: using information that would not have been known at the decision time.", "Overfitting: changing rules or parameters repeatedly until the historical sample looks unusually good.", "Survivorship bias: studying only instruments, companies, or strategies that remained visible while ignoring those that disappeared.", "Data-quality problems: missing candles, bad timestamps, unrealistic prices, or inconsistent session rules.", "Execution assumptions: omitting spread, commissions, slippage, gaps, liquidity, or position constraints."] },
      { heading: "Sample size and market regimes", paragraphs: ["A small number of trades can make a result highly sensitive to one or two outcomes. A longer sample may include different volatility levels, trends, ranges, news conditions, and structural changes. That does not automatically make it representative, but it gives more opportunities to ask whether the behavior is stable.", "Changing parameters after every disappointing segment can produce a strategy that describes the past rather than a rule that was specified in advance."] },
      { heading: "Out-of-sample thinking", paragraphs: ["One approach is to separate data used to develop a hypothesis from data reserved for evaluation. The reserved section should be treated as unseen until the rules are fixed. Forward testing or paper observation can add another layer of evidence, while still carrying different limitations from live execution.", "The key is not to collect a flattering number. It is to make the process transparent enough that another review could identify what was tested and what was not."] },
      { heading: "Important ForexFrame limitation", callout: "ForexFrame contains backtesting code and database structures, but the backtesting interface is currently hidden behind a feature flag. This article is educational. It does not mean that a fully available backtesting tool can currently be accessed through the public ForexFrame product, and the topic must not be confused with the normal journal analytics." },
      { heading: "A responsible test checklist", checklist: ["Write the rules and assumptions before inspecting the outcome.", "Use historical data that is appropriate for the instrument and timeframe.", "Include realistic costs and execution limitations where possible.", "Keep development and evaluation observations distinct.", "Report losing periods, drawdowns, and sample size—not only the best result.", "Treat historical results as evidence to examine, never as a promise of future performance."] },
    ],
  },
  {
    slug: "trading-review",
    path: "/academy/trading-review",
    title: "A Practical Trading Review Routine",
    category: "Trading Review & Psychology",
    description: "Create an evidence-based weekly review using completed trades, grouped analysis, process checks, and lessons that can be tested later.",
    intro: "A review routine turns a journal into a learning loop. The objective is not to find a single cause for every result, but to identify observations worth testing with future records.",
    blocks: [
      { heading: "Prepare the review", paragraphs: ["Choose a consistent period and include the completed trades that belong to the process you are reviewing. Check that dates, outcomes, and P/L are recorded consistently before drawing conclusions. Separate different strategies, instruments, timeframes, or account rules when combining them would hide important differences.", "Start with description: what happened? Only then move to interpretation: what might explain it? This order reduces the risk of turning a preferred story into a fact."] },
      { heading: "Group the records", paragraphs: ["Useful groups can include strategy, instrument, timeframe, direction, day of week, setup type, market condition, and whether the written plan was followed. A group should have enough observations to be worth inspecting; a single unusual trade is a prompt for a question, not a reliable category conclusion.", "ForexFrame’s journal and analytics can support grouping and comparison of recorded trades. They summarize entered information; they do not automatically diagnose a trader or prove causation."] },
      { heading: "Review outcomes and process", bullets: ["Check total trades, win rate, average wins, average losses, profit factor, expectancy assumptions, net P/L, and drawdown together.", "Separate a process mistake, such as unplanned size, from a planned trade that simply lost.", "Look for recurring observations across a group instead of treating one outcome as a rule.", "Ask whether a correlation could be explained by another factor, such as a change in volatility or sample selection.", "Record what evidence would support or challenge the next lesson."] },
      { heading: "Hypothetical review example", example: { title: "From observation to test", text: "A trader notices that four of six losses occurred during a late-session period. The responsible conclusion is not ‘never trade late.’ A better next step is to label the session consistently and compare a larger set of otherwise similar trades, including wins and losses, before changing the process." } },
      { heading: "Write a useful lesson", paragraphs: ["A useful lesson describes an observable behavior and a next action. ‘Check the scheduled-event calendar before recording a setup’ is easier to test than ‘be more careful.’ The next review should ask whether the action was completed and whether the relevant group changed—not whether the trader felt more confident.", "Keep the lesson separate from a prediction. A review can recommend collecting more evidence without forcing a trade decision."] },
      { heading: "Reusable weekly checklist", checklist: ["Confirm the date range and completed-trade dataset.", "Check records for missing fields, duplicate rows, or inconsistent labels.", "Group trades by the dimensions relevant to the strategy.", "Review process adherence separately from outcome.", "Compare metrics with sample size, drawdown, and costs in mind.", "Write one or two testable lessons for the next review period.", "Revisit prior lessons and record whether the planned behavior was observed."] },
      { heading: "A learning routine, not a guarantee", paragraphs: ["Regular review can make decisions more visible and support a more deliberate process. It cannot remove uncertainty, guarantee profitability, or turn a historical pattern into a reliable prediction. Keep conclusions proportional to the evidence available."] },
    ],
  },
];

const articleByPath = Object.fromEntries(articles.map((article) => [article.path, article]));

function wordCount(article) {
  return JSON.stringify(article.blocks).replace(/[^\w]+/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(article) {
  return `${Math.max(4, Math.ceil(wordCount(article) / 190))} min read`;
}

function setMeta(title, description, path) {
  document.title = `${title} · ForexFrame Academy`;
  const descriptionNode = document.querySelector('meta[name="description"]') || document.createElement("meta");
  descriptionNode.name = "description";
  descriptionNode.content = description;
  if (!descriptionNode.parentNode) document.head.appendChild(descriptionNode);
  const canonicalHref = `${SITE_URL}${path}`;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalHref;
}

function AcademyLayout({ title, intro, children, article = null }) {
  useEffect(() => {
    setMeta(title, intro, article?.path || "/academy");
    return () => {
      document.title = "ForexFrame";
    };
  }, [title, intro, article?.path]);

  return (
    <div className="public-site academy-site">
      <header className="public-header">
        <a className="public-brand" href="/" aria-label="ForexFrame home">
          <span className="logo">ForexFrame</span>
          <span className="subtitle">Trading Journal</span>
        </a>
        <nav className="academy-header-nav" aria-label="Academy navigation">
          <a href="/academy">Academy</a>
          <a className="secondary-button public-header-action" href="/">Open ForexFrame</a>
        </nav>
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}

function ArticleCard({ article, index }) {
  return (
    <a className="academy-article-card" href={article.path}>
      <span className="academy-card-number">0{index + 1}</span>
      <span className="academy-card-category">{article.category}</span>
      <h3>{article.title}</h3>
      <p>{article.description}</p>
      <span className="academy-card-meta">{readingTime(article)} <span aria-hidden="true">→</span></span>
    </a>
  );
}

function AcademyHome() {
  const categories = [...new Set(articles.map((article) => article.category))];
  return (
    <AcademyLayout title="ForexFrame Trading Academy" intro="Learn trading concepts, understand performance statistics, and develop a more structured approach to reviewing your trading decisions.">
      <main className="academy-main">
        <section className="academy-hero">
          <p className="eyebrow">FOREXFRAME TRADING ACADEMY</p>
          <h1>Learn the language of your trading process.</h1>
          <p className="academy-hero-copy">Explore practical guides on market structure, risk, journaling, statistics, equity curves, backtesting concepts, and regular trade review. The material is educational and designed to help you ask better questions of your own records.</p>
          <div className="public-actions">
            <a className="primary-button" href="#learning-resources">Explore learning resources</a>
            <a className="secondary-button" href="/about">Discover ForexFrame</a>
          </div>
        </section>

        <section className="academy-section" aria-labelledby="topics-heading">
          <div className="academy-section-heading"><div><p className="section-kicker">Browse by topic</p><h2 id="topics-heading">Choose a useful starting point</h2></div><span className="academy-section-note">{articles.length} original guides</span></div>
          <div className="academy-topic-grid">
            {categories.map((category) => <a className="academy-topic" href="#learning-resources" key={category}><span>{category}</span><small>{articles.filter((article) => article.category === category).length} {articles.filter((article) => article.category === category).length === 1 ? "guide" : "guides"}</small></a>)}
          </div>
        </section>

        <section className="academy-section" id="learning-resources" aria-labelledby="resources-heading">
          <div className="academy-section-heading"><div><p className="section-kicker">Featured learning resources</p><h2 id="resources-heading">Seven guides for a more structured review</h2></div></div>
          <div className="academy-article-grid">{articles.map((article, index) => <ArticleCard article={article} index={index} key={article.path} />)}</div>
        </section>

        <section className="academy-section academy-path-section" aria-labelledby="path-heading">
          <div className="academy-section-heading"><div><p className="section-kicker">Suggested learning path</p><h2 id="path-heading">Build understanding step by step</h2></div></div>
          <p className="academy-section-intro">This is a suggested sequence for learning and review, not a guaranteed route to profitability.</p>
          <ol className="academy-learning-path">
            {articles.map((article, index) => <li key={article.path}><span className="academy-path-index">{index + 1}</span><a href={article.path}>{article.title}</a></li>)}
          </ol>
        </section>

        <section className="academy-section academy-product-connection" aria-labelledby="product-heading">
          <p className="section-kicker">From learning to review</p>
          <h2 id="product-heading">Use concepts with your own recorded history</h2>
          <p>Once you understand a concept, ForexFrame can help you examine your own journal records. Organize trading accounts, record trades, inspect the equity curve, and use available statistics and analytics to compare the history you entered. The application does not connect to a broker, import live trades, execute trades, or guarantee future results.</p>
          <div className="public-actions"><a className="primary-button" href="/">Log in or create an account</a><a className="secondary-button" href="/about">Learn about the product</a></div>
        </section>
      </main>
    </AcademyLayout>
  );
}

function renderBlock(block) {
  return (
    <section className="academy-article-section" id={block.heading ? block.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined} key={`${block.heading || block.example?.title || block.callout || "block"}`}>
      {block.heading && <h2>{block.heading}</h2>}
      {block.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {block.bullets && <ul>{block.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
      {block.checklist && <ul className="academy-checklist">{block.checklist.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>}
      {block.formula && <pre className="academy-formula"><code>{block.formula}</code></pre>}
      {block.example && <aside className="academy-example"><strong>{block.example.title}</strong><p>{block.example.text}</p></aside>}
      {block.callout && <aside className="academy-callout"><strong>Product availability note</strong><p>{block.callout}</p></aside>}
    </section>
  );
}

function ArticlePage({ article }) {
  const related = articles.filter((candidate) => candidate.path !== article.path && (candidate.category === article.category || ["Trading Journals", "Performance Analysis"].includes(candidate.category))).slice(0, 3);
  const toc = article.blocks.filter((block) => block.heading).map((block) => ({ label: block.heading, id: block.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));
  return (
    <AcademyLayout title={article.title} intro={article.intro} article={article}>
      <main className="academy-article-main">
        <nav className="academy-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/academy">Academy</a><span aria-hidden="true">/</span><span aria-current="page">{article.title}</span></nav>
        <header className="academy-article-header">
          <span className="academy-card-category">{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.intro}</p>
          <div className="academy-article-meta"><span>{readingTime(article)}</span><span>{wordCount(article)} words of original guidance</span></div>
        </header>
        <div className="academy-article-layout">
          <aside className="academy-toc" aria-label="Table of contents"><strong>On this page</strong><nav>{toc.map((item) => <a href={`#${item.id}`} key={item.id}>{item.label}</a>)}</nav></aside>
          <article className="academy-article-content">
            {article.blocks.map(renderBlock)}
            <aside className="academy-disclaimer"><strong>Educational note</strong><p>This article is for education and record review only. It is not financial advice, a trading signal, or a guarantee of future results. Trading involves financial risk.</p></aside>
            <div className="academy-article-actions"><a className="secondary-button" href="/academy">← Back to Academy</a><a className="primary-button" href="/">Explore ForexFrame</a></div>
            <section className="academy-related" aria-labelledby="related-heading"><p className="section-kicker">Continue learning</p><h2 id="related-heading">Related Academy guides</h2><div className="academy-related-grid">{related.map((candidate) => <a href={candidate.path} key={candidate.path}>{candidate.title}<span>{candidate.category} · {readingTime(candidate)}</span></a>)}</div></section>
          </article>
        </div>
      </main>
    </AcademyLayout>
  );
}

export function AcademyPage({ path }) {
  if (path === "/academy") return <AcademyHome />;
  const article = articleByPath[path];
  return article ? <ArticlePage article={article} /> : <AcademyHome />;
}

export { articles };
