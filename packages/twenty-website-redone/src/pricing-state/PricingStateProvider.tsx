'use client';

import { useMemo, useState, type ReactNode } from 'react';

import {
  PricingStateContext,
  type PlansHostingMode,
} from './pricing-state-context';

export function PricingStateProvider({ children }: { children: ReactNode }) {
  const [hosting, setHosting] = useState<PlansHostingMode>('cloud');
  const value = useMemo(() => ({ hosting, setHosting }), [hosting]);

  return (
    <PricingStateContext.Provider value={value}>
      {children}
    </PricingStateContext.Provider>
  );
}
