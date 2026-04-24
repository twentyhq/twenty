'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { PartnerProgramId } from '@/app/partners/_constants/partner-application-modal';
import { PartnerApplicationModal } from './PartnerApplicationModal';

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

  const openPartnerApplicationModal = useCallback(
    (programId?: PartnerProgramId) => {
      if (programId !== undefined) {
        setInitialProgramId(programId);
      }
      setOpen(true);
    },
    [],
  );

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
        initialProgramId={initialProgramId}
        onClose={closePartnerApplicationModal}
        open={open}
      />
    </PartnerApplicationModalContext.Provider>
  );
}
