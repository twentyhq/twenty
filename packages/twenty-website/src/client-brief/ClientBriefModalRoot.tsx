'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { ClientBriefModal } from './ClientBriefModal';
import { ClientBriefModalContext } from './client-brief-modal-context';

export function ClientBriefModalRoot({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const contextValue = useMemo(
    () => ({ openClientBriefModal: () => setIsOpen(true) }),
    [],
  );

  return (
    <ClientBriefModalContext.Provider value={contextValue}>
      {children}
      <ClientBriefModal onClose={() => setIsOpen(false)} open={isOpen} />
    </ClientBriefModalContext.Provider>
  );
}
