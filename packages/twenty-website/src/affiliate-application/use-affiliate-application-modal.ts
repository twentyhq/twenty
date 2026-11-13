'use client';

import { useContext } from 'react';

import { AffiliateApplicationModalContext } from './affiliate-application-modal-context';

export function useAffiliateApplicationModal() {
  const value = useContext(AffiliateApplicationModalContext);
  if (value === null) {
    throw new Error(
      'useAffiliateApplicationModal must be used within AffiliateApplicationModalRoot',
    );
  }
  return value;
}
