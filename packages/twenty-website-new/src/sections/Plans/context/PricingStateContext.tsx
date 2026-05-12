'use client';

import type { PlansHostingMode } from '@/sections/Plans/types';
import { type ReactNode, useState } from 'react';

import { PricingStateContext } from './pricing-state-context-value';

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
