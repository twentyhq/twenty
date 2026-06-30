'use client';

import { useContext } from 'react';

import { PartnerApplicationModalContext } from './partner-application-modal-context';

export function usePartnerApplicationModal() {
  const value = useContext(PartnerApplicationModalContext);
  if (value === null) {
    throw new Error(
      'usePartnerApplicationModal must be used within PartnerApplicationModalRoot',
    );
  }
  return value;
}
