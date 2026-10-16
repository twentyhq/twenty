'use client';

import { useContext } from 'react';

import { PricingStateContext } from './pricing-state-context';
import { doNotTranslate } from 'twenty-shared/i18n';

export function usePricingState() {
  const context = useContext(PricingStateContext);

  if (context === null) {
    throw new Error(
      doNotTranslate(
        'usePricingState must be used within a PricingStateProvider',
      ),
    );
  }
  return context;
}
