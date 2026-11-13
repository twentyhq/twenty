'use client';

import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AffiliateApplicationModalContext } from './affiliate-application-modal-context';

export function useAffiliateApplicationModal() {
  const value = useContext(AffiliateApplicationModalContext);
  if (!isDefined(value)) {
    throw new Error(
      'useAffiliateApplicationModal must be used within AffiliateApplicationModalRoot',
    );
  }
  return value;
}
