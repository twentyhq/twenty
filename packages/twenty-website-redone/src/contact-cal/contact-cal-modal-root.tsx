'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { ContactCalModal } from './contact-cal-modal';
import { ContactCalModalContext } from './contact-cal-modal-context';

export function ContactCalModalRoot({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const contextValue = useMemo(
    () => ({ openContactCalModal: () => setIsOpen(true) }),
    [],
  );

  return (
    <ContactCalModalContext.Provider value={contextValue}>
      {children}
      <ContactCalModal onClose={() => setIsOpen(false)} open={isOpen} />
    </ContactCalModalContext.Provider>
  );
}
