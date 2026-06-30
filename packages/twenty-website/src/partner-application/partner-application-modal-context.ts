'use client';

import { createContext } from 'react';

export type PartnerApplicationModalContextValue = {
  openPartnerApplicationModal: () => void;
};

export const PartnerApplicationModalContext =
  createContext<PartnerApplicationModalContextValue | null>(null);
