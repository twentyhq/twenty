'use client';

import { useContext } from 'react';

import { PricingStateContext } from './pricing-state-context-value';

export function usePricingState() {
  const context = useContext(PricingStateContext);

  if (context === null) {
    throw new Error(
      'usePricingState must be used within a PricingStateProvider',
    );
  }

  return context;
}
