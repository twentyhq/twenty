'use client';

import { useEffect } from 'react';

import type { PartnerProgramId } from './partner-application-modal-data';

export function usePartnerFormReset(
  open: boolean,
  initialProgramId: PartnerProgramId,
  callbacks: {
    formRef: React.RefObject<HTMLFormElement | null>;
    setProgramId: (id: PartnerProgramId) => void;
    setDropdownOpen: (open: boolean) => void;
    setSubmitError: (error: string | null) => void;
    setIsSubmitting: (submitting: boolean) => void;
  },
) {
  useEffect(() => {
    if (open) {
      callbacks.setProgramId(initialProgramId);
    }
  }, [open, initialProgramId, callbacks]);

  useEffect(() => {
    if (open) {
      callbacks.setSubmitError(null);
      return;
    }

    callbacks.formRef.current?.reset();
    callbacks.setProgramId('technology');
    callbacks.setDropdownOpen(false);
    callbacks.setSubmitError(null);
    callbacks.setIsSubmitting(false);
  }, [open, callbacks]);
}
