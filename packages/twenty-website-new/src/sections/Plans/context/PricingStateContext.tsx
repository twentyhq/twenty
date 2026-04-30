'use client';

import type { PlansHostingMode } from '@/sections/Plans/types';
import { createContext, type ReactNode, useContext, useState } from 'react';

type PricingStateContextValue = {
  hosting: PlansHostingMode;
  setHosting: (hosting: PlansHostingMode) => void;
};

const PricingStateContext = createContext<PricingStateContextValue | null>(
  null,
);

type PricingStateProviderProps = {
  children: ReactNode;
};

export function PricingStateProvider({ children }: PricingStateProviderProps) {
  const [hosting, setHosting] = useState<PlansHostingMode>('cloud');

  return (
    <PricingStateContext.Provider value={{ hosting, setHosting }}>
      {children}
    </PricingStateContext.Provider>
  );
}

export function usePricingState() {
  const context = useContext(PricingStateContext);

  if (context === null) {
    throw new Error(
      'usePricingState must be used within a PricingStateProvider',
    );
  }

  return context;
}
