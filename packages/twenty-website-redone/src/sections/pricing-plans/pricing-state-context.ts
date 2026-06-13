import { createContext } from 'react';

export type PlansHostingMode = 'cloud' | 'selfHost';

export type PricingStateValue = {
  hosting: PlansHostingMode;
  setHosting: (hosting: PlansHostingMode) => void;
};

// The hosting mode is the one pricing choice shared across sections (the
// plan cards and the plan table both pivot on it); billing period stays
// local to the cards.
export const PricingStateContext = createContext<PricingStateValue | null>(
  null,
);
