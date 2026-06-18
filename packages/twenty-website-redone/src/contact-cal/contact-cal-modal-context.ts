'use client';

import { createContext } from 'react';

export type ContactCalModalContextValue = {
  openContactCalModal: () => void;
};

export const ContactCalModalContext =
  createContext<ContactCalModalContextValue | null>(null);
