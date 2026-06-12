import type { PlansHostingMode } from '@/sections/Plans/types';
import { createContext } from 'react';

type PricingStateContextValue = {
  hosting: PlansHostingMode;
  setHosting: (hosting: PlansHostingMode) => void;
};

export const PricingStateContext =
  createContext<PricingStateContextValue | null>(null);
