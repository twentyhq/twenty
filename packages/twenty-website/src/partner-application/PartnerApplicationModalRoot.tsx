'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { PartnerApplicationModal } from './PartnerApplicationModal';
import { PartnerApplicationModalContext } from './partner-application-modal-context';

export function PartnerApplicationModalRoot({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contextValue = useMemo(
    () => ({ openPartnerApplicationModal: () => setIsOpen(true) }),
    [],
  );

  return (
    <PartnerApplicationModalContext.Provider value={contextValue}>
      {children}
      <PartnerApplicationModal onClose={() => setIsOpen(false)} open={isOpen} />
    </PartnerApplicationModalContext.Provider>
  );
}
