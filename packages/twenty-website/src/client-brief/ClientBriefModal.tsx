'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';

import { buildSchemeContext, fontSize, semanticColor, spacing } from '@/tokens';
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

// The wizard — its fields, schemas, and steps — ships only when the modal
// first opens, never on a page load where the visitor does not get matched.
const ClientBriefWizard = dynamic(
  () =>
    import('./wizard/ClientBriefWizard').then((mod) => ({
      default: mod.ClientBriefWizard,
    })),
  { loading: () => <WizardLoadingFallback />, ssr: false },
);

// The near-black Modal panel is scheme-agnostic; the wizard reads semantic
// colours and the Button keys on [data-scheme], so it runs on a dark scope —
// the same context the full-page /partners/brief mount establishes.
const WizardScope = styled.div`
  ${buildSchemeContext('dark')}
`;

export function ClientBriefModal({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { i18n } = useLingui();

  return (
    <Modal ariaLabel={i18n._(msg`Get matched`)} onClose={onClose} open={open}>
      <WizardScope data-scheme="dark">
        <ClientBriefWizard onSuccess={onClose} />
      </WizardScope>
    </Modal>
  );
}
