'use client';

import { useContext } from 'react';

import { ClientBriefModalContext } from './client-brief-modal-context';

export function useClientBriefModal() {
  const value = useContext(ClientBriefModalContext);
  if (value === null) {
    throw new Error(
      'useClientBriefModal must be used within ClientBriefModalRoot',
    );
  }
  return value;
}
