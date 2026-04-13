'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

  const openContactCalModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeContactCalModal = useCallback(() => {
    setOpen(false);
  }, []);

  const contextValue = useMemo(
    () => ({ openContactCalModal }),
    [openContactCalModal],
  );

  return (
    <ContactCalModalContext.Provider value={contextValue}>
      {children}
      <ContactCalModal onClose={closeContactCalModal} open={open} />
    </ContactCalModalContext.Provider>
  );
}
