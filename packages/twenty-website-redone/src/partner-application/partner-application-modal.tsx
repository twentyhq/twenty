'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import {
  buildSchemeContext,
  DURATION,
  EASING,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Modal } from '@/ui';

const WizardFallback = styled.p`
  color: ${semanticColor.inkMuted};
  font-size: ${fontSize(4)};
  padding-block: ${spacing(8)};
  text-align: center;
`;

function WizardLoadingFallback() {
  const { i18n } = useLingui();
  return <WizardFallback>{i18n._(msg`Loading…`)}</WizardFallback>;
}

// The wizard — its fields, schemas, and country list — ships only when the
// modal first opens, never on a page load where the visitor does not apply.
const PartnerApplicationWizard = dynamic(
  () =>
    import('./wizard/partner-application-wizard').then((mod) => ({
      default: mod.PartnerApplicationWizard,
    })),
  { loading: () => <WizardLoadingFallback />, ssr: false },
);

// The form sits in a narrow panel; the booking screen eases wider for the
// calendar. The Modal reads --modal-panel-width, so the change is a smooth
// transition rather than the old site's instant jump.
const formPanelClass = css`
  transition: width ${DURATION.md} ${EASING.standard};
  --modal-panel-width: min(360px, 100%);

  ${mediaUp('md')} {
    --modal-panel-width: min(720px, 100%);
  }
`;

const bookingPanelClass = css`
  transition: width ${DURATION.md} ${EASING.standard};
  --modal-panel-width: min(960px, 100%);
`;

// The near-black Modal panel is scheme-agnostic; the wizard reads semantic
// colours and the Button keys on [data-scheme], so it runs on a dark scope —
// the same context the full-page mount establishes.
const WizardScope = styled.div`
  ${buildSchemeContext('dark')}
`;

export function PartnerApplicationModal({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { i18n } = useLingui();
  const [hasReachedBooking, setHasReachedBooking] = useState(false);

  // Reset the widened panel after the modal closes, while nothing is on screen,
  // so a prior session's booking width can't flash on the next open.
  useEffect(() => {
    if (!open) setHasReachedBooking(false);
  }, [open]);

  return (
    <Modal
      ariaLabel={i18n._(msg`Partner application`)}
      className={hasReachedBooking ? bookingPanelClass : formPanelClass}
      onClose={onClose}
      open={open}
    >
      <WizardScope data-scheme="dark">
        <PartnerApplicationWizard
          onSubmitted={() => setHasReachedBooking(true)}
          onSuccess={onClose}
          resetSignal={0}
        />
      </WizardScope>
    </Modal>
  );
}
