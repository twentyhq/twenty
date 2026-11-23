'use client';

import { createContext } from 'react';

export type AffiliateApplicationModalContextValue = {
  openAffiliateApplicationModal: () => void;
};

export const AffiliateApplicationModalContext =
  createContext<AffiliateApplicationModalContextValue | null>(null);
