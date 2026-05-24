import { useState } from 'react';
import {
  accounts,
  financialSections,
  formatCurrency,
  notifications,
  recommendationOutput,
  totalBalance,
  userProfile,
} from './data/mockData';
import './App.css';

type TabId = 'home' | 'moveMoney' | 'advice' | 'scene' | 'more';
type Overlay =
  | { type: 'account'; id: string }
  | { type: 'notification'; id: string }
  | { type: 'investment' }
  | null;

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

function Header() {
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">S</div>
        <button className="search-pill" type="button" onClick={() => alert('Search placeholder')}>
          🔍 Search
        </button>
      </div>
      <h1 className="greeting">
        {userProfile.greeting()}, {userProfile.firstName}
      </h1>
    </header>
  );
}

function AttentionCard({ onItemPress }: { onItemPress: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

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

function RecommendationBanner({ onCtaPress }: { onCtaPress: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [dontShow, setDontShow] = useState(false);

  if (!visible) return null;

  return (
    <div className="rec-wrap">
      <div className="rec-card">
        <div className="rec-header">
          <span className="rec-icon">✦</span>
          <p className="rec-summary">{recommendationOutput.summary}</p>
        </div>

        {expanded && (
          <div className="rec-expanded">
            <p className="rec-detail">{recommendationOutput.detail}</p>
            <div className="outcome-box">
              <p className="outcome-label">Projected outcome</p>
              <p className="outcome-text">{recommendationOutput.projectedOutcome}</p>
            </div>
            <div className="video-placeholder">
              <span className="video-play">▶</span>
              <span className="video-label">30-sec: TFSA basics</span>
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={onCtaPress}>
              {recommendationOutput.ctaLabel}
            </button>
            <a
              className="learn-more"
              href={recommendationOutput.learnMoreUrl}
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
              />
              Do not show again
            </label>
          </div>
        )}

        {!expanded && (
          <div className="rec-actions">
            <button type="button" className="btn-text-muted" onClick={() => setVisible(false)}>
              Dismiss
            </button>
            <button type="button" className="btn-text-blue" onClick={() => setExpanded(true)}>
              View Details
            </button>
          </div>
        )}

        {expanded && (
          <button type="button" className="collapse-btn" onClick={() => setExpanded(false)}>
            ▲
          </button>
        )}
      </div>
    </div>
  );
}

function AccountOverviewCard({ onAccountPress }: { onAccountPress: (id: string) => void }) {
  const [tab, setTab] = useState<'accounts' | 'updates'>('accounts');
  const [bankingOpen, setBankingOpen] = useState(true);

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
          <button type="button" className="section-header" onClick={() => setBankingOpen((v) => !v)}>
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
          <div className="divider" />
          <div className="total-row">
            <span className="total-label">Total balance</span>
            <span className="total-balance">{formatCurrency(totalBalance)}</span>
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
  onNotificationPress,
  onAccountPress,
  onInvestmentPress,
}: {
  onNotificationPress: (id: string) => void;
  onAccountPress: (id: string) => void;
  onInvestmentPress: () => void;
}) {
  return (
    <div className="phone-content">
      <Header />
      <AttentionCard onItemPress={onNotificationPress} />
      <RecommendationBanner onCtaPress={onInvestmentPress} />
      <AccountOverviewCard onAccountPress={onAccountPress} />
      {financialSections.map((section) => (
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

function PlaceholderScreen({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) {
  return (
    <div className="placeholder-screen">
      <span className="placeholder-icon">{icon}</span>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-sub">{subtitle}</p>
    </div>
  );
}

function AccountDetailsScreen({ accountId, onBack }: { accountId: string; onBack: () => void }) {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return null;

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
  notificationId,
  onBack,
}: {
  notificationId: string;
  onBack: () => void;
}) {
  const item = notifications.find((n) => n.id === notificationId);
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

function InvestmentFlowScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="overlay">
      <div className="overlay-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ←
        </button>
        <span className="overlay-title">iTRADE</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="overlay-body">
        <div className="hero-icon">📈</div>
        <h2 className="invest-title">Start investing in your TFSA</h2>
        <p className="invest-sub">{recommendationOutput.summary}</p>
        <div className="info-card">
          <p className="info-label">Suggested amount</p>
          <p className="info-value">$25.00 / month</p>
        </div>
        <div className="info-card">
          <p className="info-label">Projected outcome (10 yrs)</p>
          <p className="info-value" style={{ color: 'var(--green)' }}>
            ~$4,100 tax-free
          </p>
        </div>
        <button type="button" className="btn-primary" style={{ marginTop: 16 }}>
          Continue
        </button>
        <button
          type="button"
          className="learn-more"
          style={{ marginTop: 16, display: 'block', width: '100%' }}
        >
          Learn about TFSAs
        </button>
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNotificationPress={(id) => setOverlay({ type: 'notification', id })}
            onAccountPress={(id) => setOverlay({ type: 'account', id })}
            onInvestmentPress={() => setOverlay({ type: 'investment' })}
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
    <div className="phone">
      {activeTab === 'home' ? renderTab() : <div className="phone-content">{renderTab()}</div>}
      {!overlay && <BottomTabBar active={activeTab} onChange={setActiveTab} />}
      {overlay?.type === 'account' && (
        <AccountDetailsScreen accountId={overlay.id} onBack={() => setOverlay(null)} />
      )}
      {overlay?.type === 'notification' && (
        <NotificationDetailsScreen notificationId={overlay.id} onBack={() => setOverlay(null)} />
      )}
      {overlay?.type === 'investment' && <InvestmentFlowScreen onBack={() => setOverlay(null)} />}
    </div>
  );
}
