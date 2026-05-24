export interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

/** Swap with your pipeline output */
export interface RecommendationOutput {
  summary: string;
  detail: string;
  projectedOutcome: string;
  ctaLabel: string;
  learnMoreUrl: string;
}

export const userProfile = {
  firstName: 'Muhammad Ahmed',
  greeting: () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  },
};

export const accounts: Account[] = [
  { id: '1', name: 'Preferred Package', balance: 12450.32, type: 'Chequing' },
  { id: '2', name: 'Money Master', balance: 8320.75, type: 'Savings' },
];

export const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

export const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Verify your contact information',
    description: 'Please confirm your email and phone number to keep your account secure.',
    date: 'Today',
  },
];

export const recommendationOutput: RecommendationOutput = {
  summary: 'Invest $25 into your TFSA using iTRADE',
  detail:
    'Based on your monthly cash flow, you have surplus savings that could grow tax-free in a TFSA. Starting with $25/month builds the habit without impacting day-to-day spending.',
  projectedOutcome:
    'At 6% annual return, $25/month over 10 years could grow to approximately $4,100 — all tax-free.',
  ctaLabel: 'Open iTRADE',
  learnMoreUrl: 'https://example.com/tfsa-basics',
};

export const financialSections = [
  { id: 'credit', title: 'Credit cards', subtitle: '$2,847.50 balance', cta: 'Pay now' },
  { id: 'borrow', title: 'Borrowing', subtitle: '$15,200.00 outstanding', cta: 'View details' },
  { id: 'invest', title: 'Investments', subtitle: '$3,420.00 portfolio value', cta: 'Explore' },
];

export const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
