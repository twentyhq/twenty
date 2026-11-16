'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { AffiliateApplicationModal } from './AffiliateApplicationModal';
import { AffiliateApplicationModalContext } from './affiliate-application-modal-context';

export function AffiliateApplicationModalRoot({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contextValue = useMemo(
    () => ({ openAffiliateApplicationModal: () => setIsOpen(true) }),
    [],
  );

  return (
    <AffiliateApplicationModalContext.Provider value={contextValue}>
      {children}
      <AffiliateApplicationModal
        onClose={() => setIsOpen(false)}
        open={isOpen}
      />
    </AffiliateApplicationModalContext.Provider>
  );
}
