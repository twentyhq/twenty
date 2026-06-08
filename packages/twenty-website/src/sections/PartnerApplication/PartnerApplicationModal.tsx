'use client';

import { Modal } from '@/design-system/components';
import {
  PartnerApplicationWizard,
  partnerWizardPanelClass,
} from '@/sections/PartnerApplication/wizard/PartnerApplicationWizard';
import { useEffect, useState } from 'react';

type PartnerApplicationModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PartnerApplicationModal({
  open,
  onClose,
}: PartnerApplicationModalProps) {
  const [resetSignal, setResetSignal] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setResetSignal((n) => n + 1);
      setSubmitted(false);
    }
  }, [open]);

  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      className={partnerWizardPanelClass}
      panelWidth={submitted ? 'min(960px, 100%)' : undefined}
    >
      <PartnerApplicationWizard
        resetSignal={resetSignal}
        onSuccess={onClose}
        onSubmitted={() => setSubmitted(true)}
      />
    </Modal.Root>
  );
}
