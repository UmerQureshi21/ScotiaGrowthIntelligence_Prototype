import { useState } from "react";
import {
  sarahPersona,
  marcusPersona,
  formatCurrency,
  greeting,
  type Persona,
} from "./data/mockData";
import { sendMarcusTriggerEmail } from "./services/email";
import "./App.css";

type TabId = "home" | "moveMoney" | "advice" | "scene" | "more";
type Overlay =
  | { type: "account"; id: string }
  | { type: "notification"; id: string }
  | { type: "account-open" }
  | { type: "investment" }
  | null;
type EmailStatus = "idle" | "waiting" | "sending" | "sent" | "error";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "moveMoney", label: "Move Money", icon: "transfer" },
  { id: "advice", label: "Advice+", icon: "bulb" },
  { id: "scene", label: "Scene+", icon: "star" },
  { id: "more", label: "More", icon: "menu" },
];

const SECTION_ICONS: Record<string, string> = {
  credit: "card",
  borrow: "dollar",
  invest: "trending",
};

function Icon({
  name,
  size = 22,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const d: Record<string, string> = {
    home: "M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z",
    transfer: "M16 3l4 4-4 4V7H4V5h12V3zm-8 10l-4 4 4 4v-2h12v-2H8v-2z",
    bulb: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
    star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    card: "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
    dollar:
      "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
    trending:
      "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
    search:
      "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    arrowDown: "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    mail: "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={d[name] ?? ""} />
    </svg>
  );
}

// ─── Side Panel ────────────────────────────────────────────────────────────

function SidePanel({
  activePersona,
  onPersonaChange,
  depositTriggered,
  emailStatus,
  onTrigger,
}: {
  activePersona: "sarah" | "marcus";
  onPersonaChange: (p: "sarah" | "marcus") => void;
  depositTriggered: boolean;
  emailStatus: EmailStatus;
  onTrigger: () => void;
}) {
  const persona = activePersona === "sarah" ? sarahPersona : marcusPersona;

  return (
    <aside className="side-panel">
      <p className="sp-section-label">Demo Controls</p>

      {/* Persona selector */}
      <div className="sp-section">
        <p className="sp-label">Persona</p>
        <button
          type="button"
          className={`sp-persona-btn ${activePersona === "sarah" ? "active" : ""}`}
          onClick={() => onPersonaChange("sarah")}
        >
          <span className="sp-persona-dot" />
          <div>
            <div className="sp-persona-name">Sarah</div>
            <div className="sp-persona-meta">Age 26 · TFSA · In-app</div>
          </div>
        </button>
        <button
          type="button"
          className={`sp-persona-btn ${activePersona === "marcus" ? "active" : ""}`}
          onClick={() => onPersonaChange("marcus")}
        >
          <span className="sp-persona-dot" />
          <div>
            <div className="sp-persona-name">Marcus</div>
            <div className="sp-persona-meta">Age 31 · RRSP · Email</div>
          </div>
        </button>
      </div>

      {/* Model output */}
      <div className="sp-section">
        <p className="sp-label">Model Output</p>
        <div className="sp-model-grid">
          <div className="sp-model-cell">
            <span className="sp-model-key">Likelihood</span>
            <span className="sp-model-val">
              {persona.modelOutput.likelihood}
            </span>
          </div>
          <div className="sp-model-cell">
            <span className="sp-model-key">Product</span>
            <span className="sp-model-val">{persona.modelOutput.product}</span>
          </div>
          <div className="sp-model-cell sp-model-full">
            <span className="sp-model-key">Channel</span>
            <span className="sp-model-val">{persona.modelOutput.channel}</span>
          </div>
          <div className="sp-model-cell sp-model-full">
            <span className="sp-model-key">Trigger</span>
            <span className="sp-model-val sp-model-muted">
              {persona.modelOutput.trigger}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger events — both personas */}
      <div className="sp-section">
        <p className="sp-label">Trigger Events</p>
        <button
          type="button"
          className="sp-trigger-btn"
          onClick={onTrigger}
          disabled={depositTriggered}
        >
          {depositTriggered
            ? "✓  Tax Refund Deposited"
            : "💸  Simulate Tax Refund"}
        </button>

        {activePersona === "marcus" && emailStatus !== "idle" && (
          <div className="sp-status-track">
            <StatusRow
              label="Deposit posted"
              done={depositTriggered}
              active={false}
            />
            <StatusRow
              label="Waiting 2 s…"
              done={emailStatus !== "waiting"}
              active={emailStatus === "waiting"}
            />
            <StatusRow
              label="Sending email"
              done={emailStatus === "sent" || emailStatus === "error"}
              active={emailStatus === "sending"}
              error={emailStatus === "error"}
            />
            <StatusRow
              label={
                emailStatus === "error"
                  ? "Send failed — check API key"
                  : "Email sent ✓"
              }
              done={emailStatus === "sent"}
              active={false}
              error={emailStatus === "error"}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function StatusRow({
  label,
  done,
  active,
  error,
}: {
  label: string;
  done: boolean;
  active: boolean;
  error?: boolean;
}) {
  const cls = error
    ? "status-error"
    : done
      ? "status-done"
      : active
        ? "status-active"
        : "status-pending";
  return (
    <div className={`sp-status-row ${cls}`}>
      <span className="sp-status-dot" />
      <span>{label}</span>
    </div>
  );
}

// ─── Phone components ───────────────────────────────────────────────────────

function Header({ persona }: { persona: Persona }) {
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo-wrap">
          <img src="/scotia-logo.png" alt="Scotiabank" className="logo-img" />
        </div>
        <button
          className="search-pill"
          type="button"
          onClick={() => alert("Search placeholder")}
        >
          <Icon name="search" size={15} color="rgba(255,255,255,0.9)" /> Search
        </button>
      </div>
      <h1 className="greeting">
        {greeting()}, {persona.userProfile.firstName}
      </h1>
    </header>
  );
}

function AttentionCard({
  persona,
  onItemPress,
}: {
  persona: Persona;
  onItemPress: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { notifications } = persona;
  if (notifications.length === 0) return null;

  return (
    <div className="attention-wrap">
      <div
        className="attention-card"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      >
        <div className="attention-row">
          <span className="badge-purple">{notifications.length}</span>
          <span className="attention-title">
            {notifications.length} item needs attention.
          </span>
          <span className="chevron">{expanded ? "▲" : "▼"}</span>
        </div>
        {expanded && (
          <div className="attention-expanded">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                className="attention-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemPress(item.id);
                }}
              >
                <span>{item.title}</span>
                <span>›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bouncing bubble — appears after trigger, click opens the sheet
function InvestmentBar({
  rec,
  product,
  onDismiss,
  onOpenAccount,
}: {
  rec: Persona["recommendation"];
  product: string;
  onDismiss: () => void;
  onOpenAccount: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dontAsk, setDontAsk] = useState(
    () => localStorage.getItem("scotia_dontask") === "true",
  );

  const handleDontAsk = (checked: boolean) => {
    setDontAsk(checked);
    if (checked) localStorage.setItem("scotia_dontask", "true");
    else localStorage.removeItem("scotia_dontask");
  };

  if (expanded) {
    return (
      <>
        <div className="sheet-backdrop" onClick={() => setExpanded(false)} />
        <div className="bottom-sheet invest-sheet">
          <div className="sheet-handle" />
          <p className="ibar-title">
            Start your {product} with Scotiabank{" "}
            {rec.ctaLabel.replace("Open ", "")}
          </p>
          <p className="ibar-preview" style={{ marginBottom: 20 }}>
            {rec.detail}
          </p>
          <p className="ibar-video-label">
            Learn about {rec.ctaLabel.replace("Open ", "")}
          </p>
          <div className="sheet-video-wrap" style={{ marginBottom: 20 }}>
            <video
              className="explainer-video"
              src="/tfsa-example.mp4"
              controls
              playsInline
            />
          </div>
          <label className="ibar-checkbox-row">
            <input
              type="checkbox"
              checked={dontAsk}
              onChange={(e) => handleDontAsk(e.target.checked)}
            />
            Do not ask again
          </label>
          <div className="ibar-actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="ibar-btn-dismiss"
              onClick={onDismiss}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="ibar-btn-primary"
              onClick={onOpenAccount}
            >
              {rec.ctaLabel}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="invest-bubble">
      <div className="invest-bubble-body">
        <p className="invest-bubble-title">{rec.summary}</p>
        <p className="invest-bubble-sub">{rec.detail}</p>
        <div className="invest-bubble-actions">
          <button
            type="button"
            className="ibar-btn-dismiss"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button
            type="button"
            className="ibar-btn-primary"
            onClick={() => setExpanded(true)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountOverviewCard({
  persona,
  depositTriggered,
  onAccountPress,
}: {
  persona: Persona;
  depositTriggered: boolean;
  onAccountPress: (id: string) => void;
}) {
  const [tab, setTab] = useState<"accounts" | "updates">("accounts");
  const [bankingOpen, setBankingOpen] = useState(true);

  const accounts = persona.accounts.map((a) => {
    if (depositTriggered && a.type === "Chequing") {
      return { ...a, balance: a.balance + 1500 };
    }
    return a;
  });
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="card-section">
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === "accounts" ? "active" : ""}`}
          onClick={() => setTab("accounts")}
        >
          My accounts
        </button>
        <button
          type="button"
          className={`tab ${tab === "updates" ? "active" : ""}`}
          onClick={() => setTab("updates")}
        >
          My updates
        </button>
      </div>

      {tab === "accounts" ? (
        <>
          <button
            type="button"
            className="section-header"
            onClick={() => setBankingOpen((v) => !v)}
          >
            Banking
            <span>{bankingOpen ? "▲" : "▼"}</span>
          </button>
          {bankingOpen &&
            accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className="account-row"
                onClick={() => onAccountPress(account.id)}
              >
                <div>
                  <div className="account-name">{account.name}</div>
                  <div className="account-type">{account.type}</div>
                </div>
                <div className="account-right">
                  {formatCurrency(account.balance)}
                  <span>›</span>
                </div>
              </button>
            ))}
          {depositTriggered && (
            <>
              <p className="deposit-section-label">Recent transactions</p>
              <div className="deposit-toast">
                <div className="deposit-icon">
                  <Icon name="arrowDown" size={15} color="#34c759" />
                </div>
                <div className="deposit-info">
                  <span className="deposit-label">CRA Tax Refund</span>
                  <span className="deposit-sublabel">Deposited · Just now</span>
                </div>
                <span className="deposit-amount">+$1,500.00</span>
              </div>
            </>
          )}
          <div className="divider" />
          <div className="total-row">
            <span className="total-label">Total balance</span>
            <span className="total-balance">{formatCurrency(total)}</span>
          </div>
          <button
            type="button"
            className="open-account"
            onClick={() => alert("Open account placeholder")}
          >
            Open account
          </button>
        </>
      ) : (
        <p className="updates-empty">No new updates at this time.</p>
      )}
    </div>
  );
}

function HomeScreen({
  persona,
  depositTriggered,
  onNotificationPress,
  onAccountPress,
  onInvestmentPress,
}: {
  persona: Persona;
  depositTriggered: boolean;
  onNotificationPress: (id: string) => void;
  onAccountPress: (id: string) => void;
  onInvestmentPress: () => void;
}) {
  return (
    <div className="phone-content">
      <Header persona={persona} />
      <AttentionCard persona={persona} onItemPress={onNotificationPress} />
      <AccountOverviewCard
        persona={persona}
        depositTriggered={depositTriggered}
        onAccountPress={onAccountPress}
      />
      {persona.financialSections.map((section) => (
        <div key={section.id} className="fin-card">
          <div className="fin-left">
            <span className="fin-icon">
              <Icon name={SECTION_ICONS[section.id]} size={20} />
            </span>
            <div>
              <div className="fin-title">{section.title}</div>
              <div className="fin-subtitle">{section.subtitle}</div>
            </div>
          </div>
          <button
            type="button"
            className="fin-cta"
            onClick={(e) => {
              e.stopPropagation();
              if (section.id === "invest") onInvestmentPress();
              else alert(`${section.cta}: ${section.subtitle}`);
            }}
          >
            {section.cta}
          </button>
        </div>
      ))}
      <div className="scroll-spacer" />
    </div>
  );
}

function PlaceholderScreen({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="placeholder-screen">
      <span className="placeholder-icon">
        <Icon name={icon} size={40} />
      </span>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-sub">{subtitle}</p>
    </div>
  );
}

function AccountDetailsScreen({
  persona,
  depositTriggered,
  accountId,
  onBack,
}: {
  persona: Persona;
  depositTriggered: boolean;
  accountId: string;
  onBack: () => void;
}) {
  const raw = persona.accounts.find((a) => a.id === accountId);
  if (!raw) return null;
  const account =
    depositTriggered && raw.type === "Chequing"
      ? { ...raw, balance: raw.balance + 1500 }
      : raw;

  return (
    <div className="overlay">
      <div className="overlay-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ←
        </button>
        <span className="overlay-title">{account.name}</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <p className="detail-balance">{formatCurrency(account.balance)}</p>
        <p className="detail-type">{account.type} account</p>
        {depositTriggered && account.type === "Chequing" && (
          <div className="deposit-toast" style={{ margin: "12px 0" }}>
            <span className="deposit-dot" />
            <span className="deposit-label">CRA Tax Refund</span>
            <span className="deposit-amount">+$1,500.00</span>
          </div>
        )}
        <div className="info-card">
          <p className="info-label">Available balance</p>
          <p className="info-value">{formatCurrency(account.balance)}</p>
        </div>
        <div className="info-card">
          <p className="info-label">Account number</p>
          <p className="info-value">****{account.id.padStart(4, "0")}</p>
        </div>
      </div>
    </div>
  );
}

function NotificationDetailsScreen({
  persona,
  notificationId,
  onBack,
}: {
  persona: Persona;
  notificationId: string;
  onBack: () => void;
}) {
  const item = persona.notifications.find((n) => n.id === notificationId);
  if (!item) return null;

  return (
    <div className="overlay">
      <div className="overlay-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ←
        </button>
        <span className="overlay-title">Notification</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <span className="action-badge">Action required</span>
        <h2 className="invest-title">{item.title}</h2>
        <p className="detail-type">{item.date}</p>
        <p className="rec-detail">{item.description}</p>
        <button type="button" className="btn-red">
          Verify now
        </button>
      </div>
    </div>
  );
}

// Screen 2 — TFSA explainer with video
// Screen 3 — one-tap account opening
function AccountOpenScreen({
  persona,
  onBack,
}: {
  persona: Persona;
  onBack: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="overlay">
        <div className="overlay-header">
          <span style={{ width: 24 }} />
          <span className="overlay-title">Account Opened</span>
          <span style={{ width: 24 }} />
        </div>
        <div
          className="overlay-body"
          style={{ textAlign: "center", paddingTop: 48 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#e6f9ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="check" size={36} color="#1a9e3f" />
          </div>
          <h2 className="invest-title">
            Your {persona.modelOutput.product} is open!
          </h2>
          <p className="invest-sub" style={{ marginBottom: 24 }}>
            Your first $25 contribution has been scheduled. Welcome to
            investing, {persona.userProfile.firstName}.
          </p>
          <div className="info-card">
            <p className="info-label">Account</p>
            <p className="info-value">{persona.modelOutput.product} — iTRADE</p>
          </div>
          <div className="info-card">
            <p className="info-label">First contribution</p>
            <p className="info-value" style={{ color: "var(--green)" }}>
              $25.00 scheduled
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: 24 }}
            onClick={onBack}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
      <div className="overlay-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ←
        </button>
        <span className="overlay-title">
          Open Your {persona.modelOutput.product}
        </span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <p className="invest-sub" style={{ marginBottom: 16 }}>
          Your details are pre-filled from your Scotia profile. Review and
          confirm.
        </p>
        <div className="info-card">
          <p className="info-label">Full name</p>
          <p className="info-value">{persona.userProfile.firstName} ···</p>
        </div>
        <div className="info-card">
          <p className="info-label">SIN</p>
          <p className="info-value">*** *** ***</p>
        </div>
        <div className="info-card">
          <p className="info-label">Account type</p>
          <p className="info-value">{persona.modelOutput.product} — iTRADE</p>
        </div>
        <div className="info-card">
          <p className="info-label">First contribution</p>
          <p className="info-value">$25.00</p>
        </div>
        <div className="info-card">
          <p className="info-label">Funded from</p>
          <p className="info-value">Preferred Package (Chequing)</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 24 }}
          onClick={() => setConfirmed(true)}
        >
          Confirm &amp; Open Account
        </button>
        <p
          style={{
            fontSize: 11,
            color: "#666",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          By confirming you agree to Scotia's iTRADE account terms.
        </p>
      </div>
    </div>
  );
}

// Marcus email confirmation screen
function EmailConfirmationScreen({
  persona,
  onBack,
}: {
  persona: Persona;
  onBack: () => void;
}) {
  const rec = persona.recommendation;
  return (
    <div className="overlay">
      <div className="overlay-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ←
        </button>
        <span className="overlay-title">Smart Investor</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <div className="hero-icon">
          <Icon name="mail" size={40} />
        </div>
        <h2 className="invest-title">
          Check your inbox, {persona.userProfile.firstName}
        </h2>
        <p className="invest-sub">
          We've sent a personalized RRSP breakdown to your email — including
          your estimated tax savings and contribution room based on your income.
        </p>
        <div
          className="info-card"
          style={{ background: "#0d1f33", borderLeft: "3px solid #003366" }}
        >
          <p className="info-label">Sent to</p>
          <p className="info-value">m*****s@gmail.com</p>
        </div>
        <div className="info-card">
          <p className="info-label">Recommended product</p>
          <p className="info-value">
            {persona.modelOutput.product} via Smart Investor
          </p>
        </div>
        <div className="info-card">
          <p className="info-label">Projected outcome (20 yrs)</p>
          <p className="info-value" style={{ color: "var(--green)" }}>
            ~$23,000 + tax refund
          </p>
        </div>
        <button type="button" className="btn-primary" style={{ marginTop: 16 }}>
          {rec.ctaLabel}
        </button>
        <button
          type="button"
          style={{
            marginTop: 10,
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: "1.5px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
          onClick={() => alert("Advisor booking placeholder")}
        >
          Book a Scotia advisor call
        </button>
        <p
          style={{
            fontSize: 11,
            color: "#888",
            textAlign: "center",
            marginTop: 12,
          }}
        >
          A Scotia advisor will follow up within 1 business day.
        </p>
      </div>
    </div>
  );
}

function BottomTabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-item ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-icon">
            <Icon name={tab.icon} size={22} />
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [activePersona, setActivePersona] = useState<"sarah" | "marcus">(
    "sarah",
  );
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [triggered, setTriggered] = useState<
    Record<"sarah" | "marcus", boolean>
  >({ sarah: false, marcus: false });
  const [recDismissed, setRecDismissed] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");

  const persona = activePersona === "sarah" ? sarahPersona : marcusPersona;
  const depositTriggered = triggered[activePersona];

  const handlePersonaChange = (p: "sarah" | "marcus") => {
    setActivePersona(p);
    setOverlay(null);
    setActiveTab("home");
    setRecDismissed(false);
  };

  const handleTrigger = async () => {
    if (triggered[activePersona]) return;
    setTriggered((prev) => ({ ...prev, [activePersona]: true }));

    if (activePersona === "marcus") {
      setEmailStatus("waiting");
      await new Promise((r) => setTimeout(r, 2000));
      setEmailStatus("sending");
      try {
        await sendMarcusTriggerEmail();
        setEmailStatus("sent");
      } catch (e) {
        console.error(e);
        setEmailStatus("error");
      }
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            persona={persona}
            depositTriggered={depositTriggered}
            onNotificationPress={(id) =>
              setOverlay({ type: "notification", id })
            }
            onAccountPress={(id) => setOverlay({ type: "account", id })}
            onInvestmentPress={() => setOverlay({ type: "investment" })}
          />
        );
      case "moveMoney":
        return (
          <PlaceholderScreen
            title="Move Money"
            subtitle="Transfer between accounts, pay bills, or send e-Transfers."
            icon="transfer"
          />
        );
      case "advice":
        return (
          <PlaceholderScreen
            title="Advice+"
            subtitle="Personalized financial guidance and planning tools."
            icon="bulb"
          />
        );
      case "scene":
        return (
          <PlaceholderScreen
            title="Scene+"
            subtitle="Earn and redeem Scene+ points on everyday purchases."
            icon="star"
          />
        );
      case "more":
        return (
          <PlaceholderScreen
            title="More"
            subtitle="Settings, help, and account preferences."
            icon="menu"
          />
        );
    }
  };

  return (
    <div className="demo-layout">
      <SidePanel
        activePersona={activePersona}
        onPersonaChange={handlePersonaChange}
        depositTriggered={depositTriggered}
        emailStatus={emailStatus}
        onTrigger={handleTrigger}
      />
      <div className="phone-wrapper">
      <div className="phone">
        {activeTab === "home" ? (
          renderTab()
        ) : (
          <div className="phone-content">{renderTab()}</div>
        )}
        {!overlay && (
          <BottomTabBar active={activeTab} onChange={setActiveTab} />
        )}
        {overlay?.type === "account" && (
          <AccountDetailsScreen
            persona={persona}
            depositTriggered={depositTriggered}
            accountId={overlay.id}
            onBack={() => setOverlay(null)}
          />
        )}
        {overlay?.type === "notification" && (
          <NotificationDetailsScreen
            persona={persona}
            notificationId={overlay.id}
            onBack={() => setOverlay(null)}
          />
        )}
        {overlay?.type === "account-open" && (
          <AccountOpenScreen
            persona={persona}
            onBack={() => setOverlay(null)}
          />
        )}
        {overlay?.type === "investment" && (
          <EmailConfirmationScreen
            persona={persona}
            onBack={() => setOverlay(null)}
          />
        )}
        {activePersona === "sarah" &&
          depositTriggered &&
          !recDismissed &&
          !overlay && (
            <InvestmentBar
              rec={persona.recommendation}
              product={persona.modelOutput.product}
              onDismiss={() => setRecDismissed(true)}
              onOpenAccount={() => {
                setRecDismissed(true);
                setOverlay({ type: "account-open" });
              }}
            />
          )}
      </div>
      </div>
    </div>
  );
}
