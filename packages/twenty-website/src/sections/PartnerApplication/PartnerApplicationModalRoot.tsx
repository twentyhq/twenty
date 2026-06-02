'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { PartnerApplicationModal } from '@/sections/PartnerApplication/PartnerApplicationModal';

type PartnerApplicationModalContextValue = {
  openPartnerApplicationModal: () => void;
};

const PartnerApplicationModalContext =
  createContext<PartnerApplicationModalContextValue | null>(null);

export function usePartnerApplicationModal() {
  const value = useContext(PartnerApplicationModalContext);
  if (!value) {
    throw new Error(
      'usePartnerApplicationModal must be used within PartnerApplicationModalRoot',
    );
  }
  return value;
}

export function PartnerApplicationModalRoot({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PartnerApplicationModalContext.Provider
      value={{ openPartnerApplicationModal: () => setOpen(true) }}
    >
      {children}
      <PartnerApplicationModal open={open} onClose={() => setOpen(false)} />
    </PartnerApplicationModalContext.Provider>
  );
}
