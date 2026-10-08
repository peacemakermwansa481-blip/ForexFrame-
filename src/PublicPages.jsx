import React, { useEffect, useState } from "react";

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

function AboutPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/about"].eyebrow}
      title={PUBLIC_PAGE_META["/about"].title}
      intro="A focused workspace for recording trades, reviewing decisions, and building a more consistent process."
    >
      <section className="public-card">
        <h2>A clearer way to review your trading process</h2>
        <p>
          ForexFrame is a trading journal and learning platform. It gives traders a place to record simulated or planned trade details, organize their trading accounts, and review performance over time.
        </p>
        <p>
          By keeping decisions, outcomes, emotions, and lessons together, ForexFrame is designed to help traders develop discipline, consistency, and better decision-making habits.
        </p>
      </section>
      <section className="public-card public-card-grid">
        <div>
          <h2>Record</h2>
          <p>Capture the context behind a trade, including setup, risk, outcome, and lesson.</p>
        </div>
        <div>
          <h2>Review</h2>
          <p>Use the journal, equity curve, statistics, and analytics to study your recorded history.</p>
        </div>
        <div>
          <h2>Learn</h2>
          <p>Identify recurring patterns and turn observations into a more deliberate trading process.</p>
        </div>
      </section>
      <section className="public-card">
        <h2>Educational and analytical purpose</h2>
        <p>
          ForexFrame is intended for educational and analytical purposes. It does not promise profitability or guaranteed trading results, and it is not financial advice. Users remain responsible for their own research, decisions, and risk management.
        </p>
      </section>
    </PublicLayout>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/contact"].eyebrow}
      title={PUBLIC_PAGE_META["/contact"].title}
      intro="Use this form to prepare a message about a technical problem, account issue, feedback, question, or suggestion."
    >
      <section className="public-card contact-card">
        <h2>Send a message</h2>
        <p>
          ForexFrame does not currently have a support email or connected email service configured. This form is ready to connect to one later; it does not send or store a message yet.
        </p>
        <form className="public-form" onSubmit={handleSubmit}>
          <label>
            Your email
            <input type="email" name="email" required placeholder="you@example.com" />
          </label>
          <label>
            Topic
            <select name="topic" defaultValue="technical">
              <option value="technical">Technical problem</option>
              <option value="account">Account issue</option>
              <option value="feedback">Feedback</option>
              <option value="question">Question</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" required placeholder="How can we help?" />
          </label>
          {submitted && (
            <p className="public-form-notice" role="status">
              Your message was not sent because no contact service is configured yet. Connect an email service before enabling production submissions.
            </p>
          )}
          <button className="primary-button" type="submit">Prepare message</button>
        </form>
      </section>
    </PublicLayout>
  );
}

function PrivacyPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/privacy"].eyebrow}
      title={PUBLIC_PAGE_META["/privacy"].title}
      intro="A plain-language overview of the information ForexFrame handles in the current application."
    >
      <section className="public-card">
        <p className="policy-updated">Current application summary · October 2026</p>
        <h2>Information you provide</h2>
        <p>
          When you create an account, ForexFrame receives the email address and password information needed for authentication. When you use the platform, you may enter trading journal data such as account settings, instruments, dates, prices, position sizes, outcomes, strategies, emotions, mistakes, lessons, and related notes.
        </p>
        <h2>How information is stored</h2>
        <p>
          ForexFrame uses Supabase for authentication and database services. Journal and account records are stored in the connected application database. The application uses owner-scoped database rules so authenticated users can access their own records through the normal application flow.
        </p>
        <h2>How information is used</h2>
        <p>
          The information is used to provide the journal, account management, equity curve, statistics, analytics, and related features requested by you. It is not used to promise or determine trading results.
        </p>
      </section>
      <section className="public-card">
        <h2>Advertising and similar technologies</h2>
        <p>
          The current application includes the Google AdSense publisher script. Google may use cookies or similar technologies to deliver, measure, and personalize advertising according to its own policies and your available choices. ForexFrame does not currently include Google Analytics code.
        </p>
        <h2>Security and third parties</h2>
        <p>
          Supabase and Google AdSense are third-party services used by the application. ForexFrame uses authentication and database access controls, but no internet service can guarantee absolute security. Do not enter information you do not want stored in the application.
        </p>
        <h2>Your choices and questions</h2>
        <p>
          You may choose what trading information to record. For privacy questions or requests, use the <a href="/contact">Contact page</a>. A support email and automated request workflow have not yet been configured.
        </p>
        <h2>Updates</h2>
        <p>
          This policy may be updated when the application, its services, or its data practices change. The latest version will be published on this page.
        </p>
      </section>
    </PublicLayout>
  );
}

function TermsPage() {
  return (
    <PublicLayout
      eyebrow={PUBLIC_PAGE_META["/terms"].eyebrow}
      title={PUBLIC_PAGE_META["/terms"].title}
      intro="Simple terms for using ForexFrame responsibly."
    >
      <section className="public-card">
        <h2>Using ForexFrame</h2>
        <p>
          You may use ForexFrame to record and review your own trading journal information for lawful educational and analytical purposes. You are responsible for ensuring that information you enter is accurate, appropriate, and yours to use.
        </p>
        <h2>Trading decisions</h2>
        <p>
          ForexFrame is not financial advice and does not guarantee profits, performance, or any particular trading outcome. You are solely responsible for your research, trading decisions, risk, and results. The platform is a journaling and analysis tool, not a broker or investment adviser.
        </p>
        <h2>Account responsibility</h2>
        <p>
          Keep your login details secure and notify ForexFrame if you believe your account has been used without permission. Do not share access to another person’s account or attempt to bypass access controls.
        </p>
      </section>
      <section className="public-card">
        <h2>Prohibited misuse</h2>
        <p>
          Do not use ForexFrame to break the law, interfere with the service, probe or bypass security controls, upload malicious content, impersonate another person, or access data that does not belong to you.
        </p>
        <h2>Availability and changes</h2>
        <p>
          Features may change, be improved, suspended, or unavailable from time to time. ForexFrame may update the service and these terms as the platform develops. Continued use after an update means you accept the revised terms.
        </p>
        <h2>Ownership and liability</h2>
        <p>
          ForexFrame’s application, design, and software remain protected by applicable intellectual-property rights. To the extent permitted by law, ForexFrame is provided without a guarantee of uninterrupted availability and is not liable for trading losses, decisions, data entered by users, or indirect losses arising from use of the service.
        </p>
        <h2>Questions</h2>
        <p>
          For questions about these terms, use the <a href="/contact">Contact page</a>. No separate legal entity or support email is configured in the current application.
        </p>
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
