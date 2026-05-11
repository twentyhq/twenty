export type Deal = {
  amount: string;
  company: string;
  initials: string;
};

export type Stage = {
  color: string;
  deals: Deal[];
  name: string;
};

export const STAGES: Stage[] = [
  {
    color: '#8b5cf6',
    deals: [
      { amount: '$12,000', company: 'Acme Corp', initials: 'AC' },
      { amount: '$8,500', company: 'Globex', initials: 'GL' },
    ],
    name: 'Qualified',
  },
  {
    color: '#0ea5e9',
    deals: [
      { amount: '$24,000', company: 'Stripe', initials: 'ST' },
      { amount: '$18,000', company: 'Linear', initials: 'LN' },
      { amount: '$6,200', company: 'Notion', initials: 'NO' },
    ],
    name: 'Meeting',
  },
  {
    color: '#16a34a',
    deals: [{ amount: '$45,000', company: 'Figma', initials: 'FG' }],
    name: 'Proposal',
  },
  {
    color: '#f59e0b',
    deals: [
      { amount: '$32,000', company: 'Vercel', initials: 'VC' },
      { amount: '$15,000', company: 'Railway', initials: 'RW' },
    ],
    name: 'Closed Won',
  },
];
