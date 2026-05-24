import { useState } from 'react';
import {
  sarahPersona,
  marcusPersona,
  formatCurrency,
  greeting,
  type Persona,
} from './data/mockData';
import { sendMarcusTriggerEmail } from './services/email';
import './App.css';

type TabId = 'home' | 'moveMoney' | 'advice' | 'scene' | 'more';
type Overlay =
  | { type: 'account'; id: string }
  | { type: 'notification'; id: string }
  | { type: 'account-open' }
  | { type: 'investment' }
  | null;
type EmailStatus = 'idle' | 'waiting' | 'sending' | 'sent' | 'error';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'moveMoney', label: 'Move Money', icon: '⇄' },
  { id: 'advice', label: 'Advice+', icon: '💡' },
  { id: 'scene', label: 'Scene+', icon: '★' },
  { id: 'more', label: 'More', icon: '☰' },
];

const SECTION_ICONS: Record<string, string> = {
  credit: '💳',
  borrow: '💰',
  invest: '📈',
};

// ─── Side Panel ────────────────────────────────────────────────────────────

function SidePanel({
  activePersona,
  onPersonaChange,
  depositTriggered,
  emailStatus,
  onTrigger,
}: {
  activePersona: 'sarah' | 'marcus';
  onPersonaChange: (p: 'sarah' | 'marcus') => void;
  depositTriggered: boolean;
  emailStatus: EmailStatus;
  onTrigger: () => void;
}) {
  const persona = activePersona === 'sarah' ? sarahPersona : marcusPersona;

  return (
    <aside className="side-panel">
      <p className="sp-section-label">Demo Controls</p>

      {/* Persona selector */}
      <div className="sp-section">
        <p className="sp-label">Persona</p>
        <button
          type="button"
          className={`sp-persona-btn ${activePersona === 'sarah' ? 'active' : ''}`}
          onClick={() => onPersonaChange('sarah')}
        >
          <span className="sp-persona-dot" />
          <div>
            <div className="sp-persona-name">Sarah</div>
            <div className="sp-persona-meta">Age 26 · TFSA · In-app</div>
          </div>
        </button>
        <button
          type="button"
          className={`sp-persona-btn ${activePersona === 'marcus' ? 'active' : ''}`}
          onClick={() => onPersonaChange('marcus')}
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
            <span className="sp-model-val">{persona.modelOutput.likelihood}</span>
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
            <span className="sp-model-val sp-model-muted">{persona.modelOutput.trigger}</span>
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
            {depositTriggered ? '✓  Tax Refund Deposited' : '💸  Simulate Tax Refund'}
          </button>

          {activePersona === 'marcus' && emailStatus !== 'idle' && (
            <div className="sp-status-track">
              <StatusRow
                label="Deposit posted"
                done={depositTriggered}
                active={false}
              />
              <StatusRow
                label="Waiting 2 s…"
                done={emailStatus !== 'waiting'}
                active={emailStatus === 'waiting'}
              />
              <StatusRow
                label="Sending email"
                done={emailStatus === 'sent' || emailStatus === 'error'}
                active={emailStatus === 'sending'}
                error={emailStatus === 'error'}
              />
              <StatusRow
                label={emailStatus === 'error' ? 'Send failed — check API key' : 'Email sent ✓'}
                done={emailStatus === 'sent'}
                active={false}
                error={emailStatus === 'error'}
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
  const cls = error ? 'status-error' : done ? 'status-done' : active ? 'status-active' : 'status-pending';
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
        <div className="logo">S</div>
        <button className="search-pill" type="button" onClick={() => alert('Search placeholder')}>
          🔍 Search
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
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        <div className="attention-row">
          <span className="badge-purple">{notifications.length}</span>
          <span className="attention-title">{notifications.length} item needs attention.</span>
          <span className="chevron">{expanded ? '▲' : '▼'}</span>
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

// Inline banner — Marcus (email channel) only
function RecommendationBanner({
  persona,
  onCtaPress,
}: {
  persona: Persona;
  onCtaPress: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const rec = persona.recommendation;
  if (persona.modelOutput.channel === 'in-app card') return null;
  if (dismissed) return null;

  return (
    <div className="rec-wrap">
      <div className="rec-card">
        <div className="rec-header">
          <span className="rec-icon">✦</span>
          <p className="rec-summary">{rec.summary}</p>
        </div>
        <p className="rec-detail" style={{ marginBottom: 12 }}>{rec.detail}</p>
        <div className="rec-actions">
          <button type="button" className="btn-text-muted" onClick={() => setDismissed(true)}>
            Dismiss
          </button>
          <button type="button" className="btn-text-blue" onClick={onCtaPress}>
            See how it works →
          </button>
        </div>
      </div>
    </div>
  );
}

// Bouncing bubble — appears after trigger, click opens the sheet
function NotificationBubble({
  persona,
  onClick,
}: {
  persona: Persona;
  onClick: () => void;
}) {
  return (
    <button type="button" className="notif-bubble" onClick={onClick}>
      <span className="notif-bubble-icon">✦</span>
      <span className="notif-bubble-text">{persona.recommendation.summary}</span>
    </button>
  );
}

// Bottom sheet modal — Sarah (in-app card) only, now includes video
function RecommendationBottomSheet({
  persona,
  onDismiss,
  onContinue,
}: {
  persona: Persona;
  onDismiss: () => void;
  onContinue: () => void;
}) {
  const rec = persona.recommendation;
  return (
    <>
      <div className="sheet-backdrop" onClick={onDismiss} />
      <div className="bottom-sheet">
        <div className="sheet-handle" />
        <div className="sheet-video-wrap">
          <video
            className="explainer-video"
            src="/vids/example.mp4"
            autoPlay
            controls
            playsInline
          />
        </div>
        <h2 className="invest-title" style={{ marginTop: 16, marginBottom: 8 }}>
          What is a {persona.modelOutput.product}?
        </h2>
        <p className="rec-detail" style={{ marginBottom: 20 }}>{rec.detail}</p>
        <button type="button" className="btn-primary" onClick={onContinue}>
          Open my {persona.modelOutput.product} — $25 to start
        </button>
        <button
          type="button"
          className="btn-text-muted"
          style={{ width: '100%', marginTop: 12, padding: '8px' }}
          onClick={onDismiss}
        >
          Not right now
        </button>
      </div>
    </>
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
  const [tab, setTab] = useState<'accounts' | 'updates'>('accounts');
  const [bankingOpen, setBankingOpen] = useState(true);

  const accounts = persona.accounts.map((a) => {
    if (depositTriggered && a.type === 'Chequing') {
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
          className={`tab ${tab === 'accounts' ? 'active' : ''}`}
          onClick={() => setTab('accounts')}
        >
          My accounts
        </button>
        <button
          type="button"
          className={`tab ${tab === 'updates' ? 'active' : ''}`}
          onClick={() => setTab('updates')}
        >
          My updates
        </button>
      </div>

      {tab === 'accounts' ? (
        <>
          <button
            type="button"
            className="section-header"
            onClick={() => setBankingOpen((v) => !v)}
          >
            Banking
            <span>{bankingOpen ? '▲' : '▼'}</span>
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
            <div className="deposit-toast">
              <span className="deposit-dot" />
              <span className="deposit-label">CRA Tax Refund</span>
              <span className="deposit-amount">+$1,500.00</span>
            </div>
          )}
          <div className="divider" />
          <div className="total-row">
            <span className="total-label">Total balance</span>
            <span className="total-balance">{formatCurrency(total)}</span>
          </div>
          <button
            type="button"
            className="open-account"
            onClick={() => alert('Open account placeholder')}
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
      <RecommendationBanner persona={persona} onCtaPress={onInvestmentPress} />
      <AccountOverviewCard
        persona={persona}
        depositTriggered={depositTriggered}
        onAccountPress={onAccountPress}
      />
      {persona.financialSections.map((section) => (
        <div key={section.id} className="fin-card">
          <div className="fin-left">
            <span className="fin-icon">{SECTION_ICONS[section.id]}</span>
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
              if (section.id === 'invest') onInvestmentPress();
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
      <span className="placeholder-icon">{icon}</span>
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
    depositTriggered && raw.type === 'Chequing'
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
        {depositTriggered && account.type === 'Chequing' && (
          <div className="deposit-toast" style={{ margin: '12px 0' }}>
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
          <p className="info-value">****{account.id.padStart(4, '0')}</p>
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
        <div className="overlay-body" style={{ textAlign: 'center', paddingTop: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 className="invest-title">Your {persona.modelOutput.product} is open!</h2>
          <p className="invest-sub" style={{ marginBottom: 24 }}>
            Your first $25 contribution has been scheduled. Welcome to investing,{' '}
            {persona.userProfile.firstName}.
          </p>
          <div className="info-card">
            <p className="info-label">Account</p>
            <p className="info-value">{persona.modelOutput.product} — iTRADE</p>
          </div>
          <div className="info-card">
            <p className="info-label">First contribution</p>
            <p className="info-value" style={{ color: 'var(--green)' }}>$25.00 scheduled</p>
          </div>
          <button type="button" className="btn-primary" style={{ marginTop: 24 }} onClick={onBack}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
      <div className="overlay-header">
        <button type="button" className="back-btn" onClick={onBack}>←</button>
        <span className="overlay-title">Open Your {persona.modelOutput.product}</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <p className="invest-sub" style={{ marginBottom: 16 }}>
          Your details are pre-filled from your Scotia profile. Review and confirm.
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
        <p style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 10 }}>
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
        <button type="button" className="back-btn" onClick={onBack}>←</button>
        <span className="overlay-title">Smart Investor</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <div className="hero-icon">✉️</div>
        <h2 className="invest-title">Check your inbox, {persona.userProfile.firstName}</h2>
        <p className="invest-sub">
          We've sent a personalized RRSP breakdown to your email — including your estimated
          tax savings and contribution room based on your income.
        </p>
        <div className="info-card" style={{ background: '#0d1f33', borderLeft: '3px solid #003366' }}>
          <p className="info-label">Sent to</p>
          <p className="info-value">m*****s@gmail.com</p>
        </div>
        <div className="info-card">
          <p className="info-label">Recommended product</p>
          <p className="info-value">{persona.modelOutput.product} via Smart Investor</p>
        </div>
        <div className="info-card">
          <p className="info-label">Projected outcome (20 yrs)</p>
          <p className="info-value" style={{ color: 'var(--green)' }}>~$23,000 + tax refund</p>
        </div>
        <button type="button" className="btn-primary" style={{ marginTop: 16 }}>
          {rec.ctaLabel}
        </button>
        <button
          type="button"
          style={{ marginTop: 10, width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          onClick={() => alert('Advisor booking placeholder')}
        >
          Book a Scotia advisor call
        </button>
        <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 12 }}>
          A Scotia advisor will follow up within 1 business day.
        </p>
      </div>
    </div>
  );
}

function BottomTabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-item ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [activePersona, setActivePersona] = useState<'sarah' | 'marcus'>('sarah');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [triggered, setTriggered] = useState<Record<'sarah' | 'marcus', boolean>>({ sarah: false, marcus: false });
  const [recDismissed, setRecDismissed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');

  const persona = activePersona === 'sarah' ? sarahPersona : marcusPersona;
  const depositTriggered = triggered[activePersona];

  const handlePersonaChange = (p: 'sarah' | 'marcus') => {
    setActivePersona(p);
    setOverlay(null);
    setActiveTab('home');
    setRecDismissed(false);
    setSheetOpen(false);
  };

  const handleTrigger = async () => {
    if (triggered[activePersona]) return;
    setTriggered((prev) => ({ ...prev, [activePersona]: true }));

    if (activePersona === 'marcus') {
      setEmailStatus('waiting');
      await new Promise((r) => setTimeout(r, 2000));
      setEmailStatus('sending');
      try {
        await sendMarcusTriggerEmail();
        setEmailStatus('sent');
      } catch (e) {
        console.error(e);
        setEmailStatus('error');
      }
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            persona={persona}
            depositTriggered={depositTriggered}
            onNotificationPress={(id) => setOverlay({ type: 'notification', id })}
            onAccountPress={(id) => setOverlay({ type: 'account', id })}
            onInvestmentPress={() =>
              activePersona === 'sarah' ? setSheetOpen(true) : setOverlay({ type: 'investment' })
            }
          />
        );
      case 'moveMoney':
        return (
          <PlaceholderScreen
            title="Move Money"
            subtitle="Transfer between accounts, pay bills, or send e-Transfers."
            icon="⇄"
          />
        );
      case 'advice':
        return (
          <PlaceholderScreen
            title="Advice+"
            subtitle="Personalized financial guidance and planning tools."
            icon="💡"
          />
        );
      case 'scene':
        return (
          <PlaceholderScreen
            title="Scene+"
            subtitle="Earn and redeem Scene+ points on everyday purchases."
            icon="★"
          />
        );
      case 'more':
        return (
          <PlaceholderScreen
            title="More"
            subtitle="Settings, help, and account preferences."
            icon="☰"
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
      <div className="phone">
        {activeTab === 'home' ? renderTab() : <div className="phone-content">{renderTab()}</div>}
        {!overlay && <BottomTabBar active={activeTab} onChange={setActiveTab} />}
        {overlay?.type === 'account' && (
          <AccountDetailsScreen
            persona={persona}
            depositTriggered={depositTriggered}
            accountId={overlay.id}
            onBack={() => setOverlay(null)}
          />
        )}
        {overlay?.type === 'notification' && (
          <NotificationDetailsScreen
            persona={persona}
            notificationId={overlay.id}
            onBack={() => setOverlay(null)}
          />
        )}
        {overlay?.type === 'account-open' && (
          <AccountOpenScreen persona={persona} onBack={() => setOverlay(null)} />
        )}
        {overlay?.type === 'investment' && (
          <EmailConfirmationScreen persona={persona} onBack={() => setOverlay(null)} />
        )}
        {activePersona === 'sarah' && depositTriggered && !recDismissed && !overlay && !sheetOpen && (
          <NotificationBubble persona={persona} onClick={() => setSheetOpen(true)} />
        )}
        {activePersona === 'sarah' && sheetOpen && !overlay && (
          <RecommendationBottomSheet
            persona={persona}
            onDismiss={() => { setSheetOpen(false); setRecDismissed(true); }}
            onContinue={() => { setSheetOpen(false); setOverlay({ type: 'account-open' }); }}
          />
        )}
      </div>
    </div>
  );
}
