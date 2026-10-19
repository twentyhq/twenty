export const GETTING_STARTED_STEPS = [
  'connectMailbox',
  'importData',
  'installApp',
  'inviteTeam',
  'handoverDeals',
  'followUpDeals',
] as const;

export type GettingStartedStep = (typeof GETTING_STARTED_STEPS)[number];

export type GettingStartedProgress = {
  creditsEarned: number;
  completedSteps: GettingStartedStep[];
  selectedStep: GettingStartedStep | null;
  snoozedUntil: string | null;
};
