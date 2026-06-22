import { createContext } from 'react';

export type PlansHostingMode = 'cloud' | 'selfHost';

export type PricingStateValue = {
  hosting: PlansHostingMode;
  setHosting: (hosting: PlansHostingMode) => void;
};

// The hosting mode is the one pricing choice shared across sections (the plan
// cards, the plan table, and the Salesforce comparison all pivot on it);
// billing period stays local to the cards.
export const PricingStateContext = createContext<PricingStateValue | null>(
  null,
);
