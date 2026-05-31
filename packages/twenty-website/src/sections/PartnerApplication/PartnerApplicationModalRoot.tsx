'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { PartnerApplicationModal } from '@/sections/PartnerApplication/PartnerApplicationModal';
import type { PartnerProgramId } from '@/sections/PartnerApplication/partner-application-modal-data';

type PartnerApplicationModalContextValue = {
  openPartnerApplicationModal: (programId?: PartnerProgramId) => void;
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
  const [initialProgramId, setInitialProgramId] =
    useState<PartnerProgramId>('technology');

  return (
    <PartnerApplicationModalContext.Provider
      value={{
        openPartnerApplicationModal: (programId?: PartnerProgramId) => {
          if (programId !== undefined) {
            setInitialProgramId(programId);
          }
          setOpen(true);
        },
      }}
    >
      {children}
      <PartnerApplicationModal
        initialProgramId={initialProgramId}
        onClose={() => setOpen(false)}
        open={open}
      />
    </PartnerApplicationModalContext.Provider>
  );
}
