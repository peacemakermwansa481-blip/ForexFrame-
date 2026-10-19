import React, { useEffect } from "react";

const CONTACT_EMAIL = "havok06481@gmail.com";

const PUBLIC_PAGE_META = {
  "/about": { title: "About ForexFrame", eyebrow: "ABOUT FOREXFRAME" },
  "/contact": { title: "Contact ForexFrame", eyebrow: "CONTACT" },
  "/privacy": { title: "Privacy Policy", eyebrow: "TRANSPARENCY" },
  "/terms": { title: "Terms of Service", eyebrow: "SERVICE TERMS" },
};

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <strong>ForexFrame</strong>
          <p>Trading journal and learning platform.</p>
        </div>
        <nav className="site-footer-links" aria-label="Information pages">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </nav>
      </div>
    </footer>
  );
}

function PublicLayout({ eyebrow, title, intro, children }) {
  useEffect(() => {
    document.title = `${title} · ForexFrame`;
    return () => {
      document.title = "ForexFrame";
    };
  }, [title]);

  return (
    <div className="public-site">
      <header className="public-header">
        <a className="public-brand" href="/" aria-label="ForexFrame home">
          <span className="logo">ForexFrame</span>
          <span className="subtitle">Trading Journal</span>
        </a>
        <a className="secondary-button public-header-action" href="/">
          Open ForexFrame
        </a>
      </header>
      <main className="public-main">
        <div className="public-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {intro && <p className="public-intro">{intro}</p>}
        </div>
        <div className="public-content">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

function PublicLinks({ links }) {
  return (
    <nav className="public-actions" aria-label="Related ForexFrame pages">
      {links.map(({ href, label, primary }) => (
        <a key={href} className={primary ? "primary-button" : "secondary-button"} href={href}>
          {label}
        </a>
      ))}
    </nav>
  );
}

function AboutPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/about"].eyebrow}
      title={PUBLIC_PAGE_META["/about"].title}
      intro="A practical workspace for recording trading activity, reviewing decisions, and building a more consistent review process."
    >
      <section className="public-card public-hero-card">
        <p className="section-kicker">A journal for deliberate review</p>
        <h2>Turn scattered trade notes into a record you can learn from.</h2>
        <p>
          ForexFrame is a trading journal and learning platform. It gives traders one place to organize trading accounts, record trades, and review the results of their own decisions over time.
        </p>
        <p>
          A consistent record can make it easier to compare what happened with what you intended to do. ForexFrame is designed to support that review; it is not designed to replace your judgment, broker, or research.
        </p>
        <PublicLinks
          links={[
            { href: "/", label: "Create an account", primary: true },
            { href: "/contact", label: "Contact us" },
          ]}
        />
      </section>

      <section className="public-card">
        <p className="section-kicker">What ForexFrame helps you do</p>
        <h2>Keep the workflow simple and useful</h2>
        <div className="public-feature-grid">
          <div>
            <h3>Organize accounts</h3>
            <p>Create and select separate trading accounts with their own starting balances.</p>
          </div>
          <div>
            <h3>Record trades</h3>
            <p>Capture trade dates, instruments, direction, prices, position size, outcome, risk measures, and review notes.</p>
          </div>
          <div>
            <h3>Review performance</h3>
            <p>Use the journal, recent-trade views, equity curve, statistics, and analytics built from your recorded trades.</p>
          </div>
          <div>
            <h3>Study patterns</h3>
            <p>Compare recorded results by factors such as instrument, strategy, timeframe, direction, outcome, and trading day.</p>
          </div>
        </div>
      </section>

      <section className="public-card public-steps-card">
        <p className="section-kicker">How it works</p>
        <h2>A straightforward review loop</h2>
        <ol className="public-steps">
          <li><strong>Create an account and sign in.</strong><span>Registration and login are handled through the application&apos;s Supabase authentication service.</span></li>
          <li><strong>Set up or select a trading account.</strong><span>Keep separate account records and starting balances organized in the journal.</span></li>
          <li><strong>Record your trades.</strong><span>Enter the details and observations you want to retain; the current application does not connect to a broker or import live trades.</span></li>
          <li><strong>Review the record.</strong><span>Use the equity curve, performance metrics, analytics, and trade details to support a structured review.</span></li>
        </ol>
      </section>

      <section className="public-card public-two-column">
        <div>
          <p className="section-kicker">Who it is for</p>
          <h2>For traders who want a clearer record</h2>
          <p>ForexFrame is intended for traders who want to organize their records and understand their historical decisions more consistently. It may be useful for learners and experienced traders alike, but it is not a promise that every trading style or workflow will be supported.</p>
        </div>
        <div>
          <p className="section-kicker">What it does not do</p>
          <h2>Important limits</h2>
          <p>ForexFrame is not a broker, financial adviser, investment manager, or trading-signal provider. It does not execute trades or guarantee profitability. Historical analysis describes recorded history; it cannot guarantee future results.</p>
        </div>
      </section>

      <section className="public-card public-callout">
        <h2>Educational disclaimer</h2>
        <p>ForexFrame is a record-keeping and analytical tool, not financial advice and not a guarantee of investment outcomes. Trading, including forex trading, involves financial risk. Make your own decisions and consider obtaining independent professional advice where appropriate.</p>
        <PublicLinks
          links={[
            { href: "/", label: "Log in or register", primary: true },
            { href: "/privacy", label: "Read the Privacy Policy" },
          ]}
        />
      </section>
    </PublicLayout>
  );
}

function ContactPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/contact"].eyebrow}
      title={PUBLIC_PAGE_META["/contact"].title}
      intro="For support, product questions, bug reports, or privacy-related requests, email the ForexFrame contact address."
    >
      <section className="public-card contact-card">
        <p className="section-kicker">Primary contact method</p>
        <h2>Email ForexFrame</h2>
        <p>The current application does not have a connected support form or automated message-delivery service. Email is the reliable contact method for this phase.</p>
        <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <p className="muted">Tapping the address should open your device&apos;s email application where supported.</p>
      </section>

      <section className="public-card">
        <p className="section-kicker">When to get in touch</p>
        <h2>Useful reasons to contact us</h2>
        <ul className="public-list">
          <li>Account access or registration problems</li>
          <li>Bug reports, including the steps that reproduce the issue</li>
          <li>Questions about the journal, accounts, trades, or analytics</li>
          <li>Feedback or suggestions about the product</li>
          <li>Privacy requests or questions about information handled by the application</li>
        </ul>
        <p>Please avoid sending passwords, authentication codes, payment details, or other sensitive credentials by email.</p>
      </section>

      <section className="public-card">
        <h2>Helpful information to include</h2>
        <p>For a technical report, include the page or feature involved, what you expected, what happened instead, and the device or browser you were using. Do not include another person&apos;s private trading records.</p>
        <PublicLinks
          links={[
            { href: "/about", label: "About ForexFrame" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
          ]}
        />
      </section>
    </PublicLayout>
  );
}

function PrivacyPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/privacy"].eyebrow}
      title={PUBLIC_PAGE_META["/privacy"].title}
      intro="A plain-language description of the information the current ForexFrame application handles and the choices that are presently available."
    >
      <section className="public-card policy-card">
        <p className="policy-updated">Last updated: October 20, 2026</p>
        <nav className="policy-toc" aria-label="Privacy Policy sections">
          <a href="#information">Information handled</a>
          <a href="#services">Services and advertising</a>
          <a href="#use-sharing">Use and sharing</a>
          <a href="#choices-security">Choices and security</a>
        </nav>

        <h2 id="scope">1. Scope</h2>
        <p>This Privacy Policy describes the current public ForexFrame web application, including its account sign-in experience, trading journal, account records, performance views, and public information pages. It is based on the current implementation and may need to be updated when the application or its service providers change.</p>

        <h2 id="information">2. Information you provide</h2>
        <p>When you register, the authentication flow uses your email address and password to create and access an account. The application does not display or store your password in its own application tables; authentication is handled through Supabase Auth.</p>
        <p>When you use the journal, you may enter trading-account information and trading records. The current schema and forms include items such as account names and starting balances; trade dates, instruments, direction, timeframe, entry, stop, target, position size, outcome, calculated risk and P/L; and optional strategy, entry or exit reasons, emotions, mistakes, lessons, and notes.</p>
        <p>The application also has separate backtesting code and database structures, but the backtesting section is currently hidden from the normal user interface. It should not be understood as a currently available public feature.</p>

        <h2>3. How the information is used</h2>
        <p>The information is used to authenticate you, keep your account and journal records separate from other users, display your recorded trades, calculate journal metrics, show equity curves and analytics, and provide the features you request. Calculations are based on information recorded in the application and are not investment recommendations.</p>

        <h2 id="services">4. Supabase authentication and database services</h2>
        <p>ForexFrame uses Supabase for authentication and database services. Supabase receives the authentication information needed to operate your account and stores the application records used by the journal. Database access rules are configured to scope normal authenticated access to the signed-in owner&apos;s records.</p>

        <h2>5. Hosting and application delivery</h2>
        <p>The application is delivered through Vercel. As with other hosted websites, the hosting and delivery infrastructure may process technical request information needed to serve pages, maintain security, and operate the service. The ForexFrame codebase does not define a separate analytics collection system or a custom request-log retention period, so those provider-specific details should be confirmed in the applicable Vercel documentation and settings.</p>

        <h2>6. Google AdSense and advertising</h2>
        <p>The current application includes the Google AdSense publisher script and an advertisement placement that is gated to the authenticated dashboard when a selected account exists, trades have finished loading, there is no account error, and at least one trade is recorded. The public information pages do not contain an advertisement placement. A placement in the code does not by itself mean an advertisement is served on every visit.</p>
        <p>Google and its partners may use cookies or similar technologies to deliver, measure, or personalize advertising according to their own policies and the choices available in the relevant region. Review Google&apos;s advertising documentation for information about its practices and available controls. The current ForexFrame implementation does not include a separate consent-management banner or personalized-ad control.</p>

        <h2>7. Cookies, browser storage, and analytics</h2>
        <p>The application source does not implement its own marketing cookies, Google Analytics, or another separate analytics SDK. Supabase&apos;s browser client manages authentication sessions using its normal client behavior, which may involve browser storage. The browser may also receive technologies from third-party services such as Google AdSense or the hosting infrastructure. Browser settings can limit some storage or cookies, but doing so may affect sign-in or other functionality.</p>

        <h2 id="use-sharing">8. Sharing and service providers</h2>
        <p>Information is shared with service providers used to operate the application, including Supabase for authentication and database services, Vercel for hosting and delivery, and Google in connection with the AdSense integration. The current application does not contain a broker connection, live-market data connection, trade-execution service, or separate email-support backend.</p>

        <h2>9. Retention</h2>
        <p>The application does not publish a fixed retention schedule. Account and journal records are intended to remain available to the account owner while the service and account continue to operate. The current application has no in-app account-deletion control, so requests to access, correct, or delete information should be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for review. Any request is subject to verification and applicable requirements.</p>

        <h2 id="choices-security">10. Security and your choices</h2>
        <p>Use a strong, unique password and do not share your sign-in details. Supabase authentication, database access rules, HTTPS delivery, and the hosting providers&apos; security controls are used as part of the service, but no internet service can guarantee absolute security. Do not enter information that you do not want stored in the application.</p>
        <p>You choose which trading details to record. You can contact ForexFrame about an access, correction, deletion, or privacy question using the address above. The current site does not claim an automated self-service deletion workflow.</p>

        <h2>11. International processing</h2>
        <p>Supabase, Vercel, Google, and their infrastructure may process information in countries other than where you live. The ForexFrame codebase does not specify a single processing location or a separate transfer mechanism; confirm the providers&apos; current terms and regional practices for details relevant to you.</p>

        <h2>12. Children</h2>
        <p>ForexFrame is not designed to solicit information from children. Do not register or use the service if doing so would violate the age or other requirements that apply to you.</p>

        <h2>13. Changes and contact</h2>
        <p>This policy may be revised when the application, its services, or its data practices change. The latest version will be published on this page. Questions and privacy requests can be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </section>
    </PublicLayout>
  );
}

function TermsPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/terms"].eyebrow}
      title={PUBLIC_PAGE_META["/terms"].title}
      intro="Plain-language terms for using ForexFrame responsibly. These terms describe the current application and are not a substitute for jurisdiction-specific legal advice."
    >
      <section className="public-card policy-card">
        <p className="policy-updated">Last updated: October 20, 2026</p>
        <nav className="policy-toc" aria-label="Terms of Service sections">
          <a href="#acceptance">Acceptance and accounts</a>
          <a href="#use">Permitted use and records</a>
          <a href="#risk">Trading risk and limits</a>
          <a href="#service">Service and legal terms</a>
        </nav>

        <h2 id="acceptance">1. Acceptance and scope</h2>
        <p>These Terms of Service apply to your use of the ForexFrame web application and its public pages. By creating an account or using the application, you agree to use it responsibly and to these terms as they apply to the current service. If you do not agree, do not create or use an account.</p>

        <h2>2. Eligibility and registration</h2>
        <p>You must be permitted to use the service under the laws and rules that apply to you. Provide an email address and other registration information that you are authorized to use. Keep your account information accurate enough for the service to operate and do not create an account by impersonating another person.</p>

        <h2>3. Account security</h2>
        <p>You are responsible for protecting your password and for activity carried out through your account. Do not share your login details. Contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you believe someone has accessed your account without permission.</p>

        <h2 id="use">4. Permitted and prohibited use</h2>
        <p>You may use ForexFrame to record and review your own trading-journal information for lawful educational and analytical purposes. Do not use the service to break the law, interfere with its operation, upload malicious content, probe or bypass access controls, impersonate another person, or access another user&apos;s records.</p>

        <h2>5. Your records and information</h2>
        <p>You are responsible for the accuracy, completeness, and lawful use of the information you enter. Do not enter another person&apos;s confidential information without authorization. You retain responsibility for keeping any separate copies of records that you need; the service should not be treated as your only backup.</p>

        <h2>6. Journal, analytics, and backtesting limitations</h2>
        <p>ForexFrame displays calculations and visualizations based on records entered into the application. Results may be affected by missing, incorrect, or inconsistent information. The current normal user interface provides journal, account, equity-curve, statistics, analytics, and trade-review features. Backtesting code and database structures exist in the project but the backtesting area is currently hidden and is not represented here as a generally available feature.</p>

        <h2 id="risk">7. Financial-risk and educational disclaimer</h2>
        <p>ForexFrame is a record-keeping and analytical tool, not a broker, financial adviser, investment manager, or trading-signal provider. It does not execute trades, connect your account to a broker, or guarantee profits or any particular result. Historical performance and simulated analysis cannot predict future outcomes. Trading, including forex trading, involves financial risk, and you are solely responsible for your research, decisions, risk management, and results.</p>

        <h2 id="service">8. Availability, maintenance, and changes</h2>
        <p>The service may be changed, maintained, interrupted, limited, or unavailable from time to time. Features may be added, removed, hidden, or changed as the application develops. No uninterrupted-availability promise is made.</p>

        <h2>9. Third-party services and links</h2>
        <p>ForexFrame relies on third-party services including Supabase for authentication and database services, Vercel for hosting and delivery, and Google in connection with advertising technology on eligible dashboard screens. Those providers have their own terms and policies. Links to third-party information do not mean ForexFrame controls or endorses those services.</p>

        <h2>10. Intellectual property</h2>
        <p>The ForexFrame application, design, text, and software are protected by applicable intellectual-property rights. These terms give you permission to use the service as provided; they do not transfer ownership of the application or authorize copying, resale, reverse engineering, or misuse of its protected components except where applicable law permits it.</p>

        <h2>11. Suspension or termination</h2>
        <p>Access may be restricted or ended where reasonably necessary to protect the service, users, data, or security, or where use violates these terms or applicable law. The current application does not provide a self-service account-deletion control. For an account-access or deletion request, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

        <h2>12. Privacy</h2>
        <p>Information handled through the service is described in the <a href="/privacy">Privacy Policy</a>. That policy forms part of the information you should review before using ForexFrame.</p>

        <h2>13. Disclaimers and limitations</h2>
        <p>To the extent permitted by applicable law, ForexFrame is provided on an as-available basis without a promise that every feature will be uninterrupted, error-free, or suitable for every purpose. ForexFrame is not responsible for trading losses, decisions made using journal outputs, inaccurate user-entered data, or indirect losses arising from use of the service. Nothing in these terms is intended to remove a right or protection that cannot lawfully be excluded.</p>

        <h2>14. Changes to these terms</h2>
        <p>These terms may be updated when the service or its practices change. The latest version will be published on this page. If you continue using ForexFrame after an update, that use will be governed by the updated terms to the extent permitted by applicable law.</p>

        <h2>15. Contact and owner review</h2>
        <p>Questions about these terms can be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The current project does not identify a legal entity, registered office, governing jurisdiction, paid plan, subscription price, refund policy, or other billing arrangement; those are decisions for the site owner to confirm before relying on this page as a final legal document.</p>
      </section>
    </PublicLayout>
  );
}

export function PublicPage({ path }) {
  if (path === "/about") return <AboutPage />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/privacy") return <PrivacyPage />;
  return <TermsPage />;
}
