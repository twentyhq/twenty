'use client';

import { useContext } from 'react';

import { ContactCalModalContext } from './contact-cal-modal-context';

export function useContactCalModal() {
  const value = useContext(ContactCalModalContext);
  if (value === null) {
    throw new Error(
      'useContactCalModal must be used within ContactCalModalRoot',
    );
  }
  return value;
}
