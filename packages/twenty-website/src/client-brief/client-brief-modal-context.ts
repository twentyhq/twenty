'use client';

import { createContext } from 'react';

export type ClientBriefModalContextValue = {
  openClientBriefModal: () => void;
};

export const ClientBriefModalContext =
  createContext<ClientBriefModalContextValue | null>(null);
