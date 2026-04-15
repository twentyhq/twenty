'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { PartnerApplicationModal } from './PartnerApplicationModal';

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

  const openPartnerApplicationModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closePartnerApplicationModal = useCallback(() => {
    setOpen(false);
  }, []);

  const contextValue = useMemo(
    () => ({ openPartnerApplicationModal }),
    [openPartnerApplicationModal],
  );

  return (
    <PartnerApplicationModalContext.Provider value={contextValue}>
      {children}
      <PartnerApplicationModal
        onClose={closePartnerApplicationModal}
        open={open}
      />
    </PartnerApplicationModalContext.Provider>
  );
}
