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
  ctaLabel: string;
  learnMoreUrl: string;
}

export interface Persona {
  userProfile: { firstName: string };
  accounts: Account[];
  notifications: NotificationItem[];
  recommendation: RecommendationOutput;
  financialSections: { id: string; title: string; subtitle: string; cta: string }[];
  modelOutput: {
    likelihood: number;
    product: string;
    channel: string;
    trigger: string;
  };
}

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
export { greeting };

export const sarahPersona: Persona = {
  userProfile: { firstName: 'Sarah' },
  accounts: [
    { id: '1', name: 'Preferred Package', balance: 12450.32, type: 'Chequing' },
    { id: '2', name: 'Money Master', balance: 8320.75, type: 'Savings' },
  ],
  notifications: [],
  recommendation: {
    summary: 'Invest $25 into your TFSA — your tax refund can grow tax-free',
    detail:
      'You have $4,200 sitting idle in chequing. A TFSA lets that money grow completely tax-free. Starting with just $25 from your refund builds the habit — and every dollar of growth stays yours.',
    ctaLabel: 'Open iTRADE',
    learnMoreUrl: 'https://example.com/tfsa-basics',
  },
  financialSections: [
    { id: 'credit', title: 'Credit cards', subtitle: '$2,847.50 balance', cta: 'Pay now' },
    { id: 'borrow', title: 'Borrowing', subtitle: '$15,200.00 outstanding', cta: 'View details' },
    { id: 'invest', title: 'Investments', subtitle: '$3,420.00 portfolio value', cta: 'Explore' },
  ],
  modelOutput: {
    likelihood: 0.81,
    product: 'TFSA',
    channel: 'in-app card',
    trigger: 'Tax refund deposit detected',
  },
};

export const marcusPersona: Persona = {
  userProfile: { firstName: 'Marcus' },
  accounts: [
    { id: '1', name: 'Preferred Package', balance: 9810.44, type: 'Chequing' },
    { id: '2', name: 'Money Master', balance: 5240.00, type: 'Savings' },
  ],
  notifications: [],
  recommendation: {
    summary: 'Your rising income means bigger RRSP tax savings — start now',
    detail:
      'Your salary has grown 15% over the last 3 months. An RRSP contribution reduces your taxable income dollar-for-dollar. Starting at $50/month locks in savings before the March deadline. A Scotia advisor can walk you through your contribution room.',
    ctaLabel: 'Open Smart Investor',
    learnMoreUrl: 'https://example.com/rrsp-basics',
  },
  financialSections: [
    { id: 'credit', title: 'Credit cards', subtitle: '$1,240.00 balance', cta: 'Pay now' },
    { id: 'borrow', title: 'Borrowing', subtitle: '$8,500.00 outstanding', cta: 'View details' },
    { id: 'invest', title: 'Investments', subtitle: 'No investments yet', cta: 'Get started' },
  ],
  modelOutput: {
    likelihood: 0.67,
    product: 'RRSP',
    channel: 'email + advisor',
    trigger: 'Salary growth pattern detected',
  },
};

// Legacy exports so nothing else breaks
export const userProfile = { firstName: sarahPersona.userProfile.firstName, greeting };
export const accounts = sarahPersona.accounts;
export const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
export const notifications = sarahPersona.notifications;
export const recommendationOutput = sarahPersona.recommendation;
export const financialSections = sarahPersona.financialSections;

export const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
