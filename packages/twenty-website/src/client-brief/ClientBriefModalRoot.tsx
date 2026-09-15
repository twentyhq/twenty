'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { ClientBriefModal } from './ClientBriefModal';
import { ClientBriefModalContext } from './client-brief-modal-context';

export function ClientBriefModalRoot({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [partnerSlug, setPartnerSlug] = useState<string | undefined>(undefined);

  const openClientBriefModal = useCallback((slug?: string) => {
    setPartnerSlug(slug);
    setIsOpen(true);
  }, []);

  const contextValue = useMemo(
    () => ({ openClientBriefModal }),
    [openClientBriefModal],
  );

  return (
    <ClientBriefModalContext.Provider value={contextValue}>
      {children}
      <ClientBriefModal
        onClose={() => setIsOpen(false)}
        open={isOpen}
        partnerSlug={partnerSlug}
      />
    </ClientBriefModalContext.Provider>
  );
}
