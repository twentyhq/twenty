'use client';

import { createContext } from 'react';

export type ClientBriefModalContextValue = {
  openClientBriefModal: (partnerSlug?: string) => void;
};

export const ClientBriefModalContext =
  createContext<ClientBriefModalContextValue | null>(null);
