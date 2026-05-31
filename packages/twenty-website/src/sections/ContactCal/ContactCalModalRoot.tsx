'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { ContactCalModal } from './ContactCalModal';

type ContactCalModalContextValue = {
  openContactCalModal: () => void;
};

const ContactCalModalContext =
  createContext<ContactCalModalContextValue | null>(null);

export function useContactCalModal() {
  const value = useContext(ContactCalModalContext);
  if (!value) {
    throw new Error(
      'useContactCalModal must be used within ContactCalModalRoot',
    );
  }
  return value;
}

export function ContactCalModalRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ContactCalModalContext.Provider
      value={{ openContactCalModal: () => setOpen(true) }}
    >
      {children}
      <ContactCalModal onClose={() => setOpen(false)} open={open} />
    </ContactCalModalContext.Provider>
  );
}
