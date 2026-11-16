'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { buildSchemeContext, mediaUp, spacing } from '@/tokens';
import { Body, Heading, Modal } from '@/ui';

import { AffiliateApplicationForm } from './AffiliateApplicationForm';
import { AFFILIATE_APPLICATION_COPY } from './affiliate-application-copy';

const formPanelClass = css`
  --modal-panel-width: min(360px, 100%);

  ${mediaUp('md')} {
    --modal-panel-width: min(720px, 100%);
  }
`;

// Same dark scope as PartnerApplicationModal, so both programs apply the same way.
const FormScope = styled.div`
  ${buildSchemeContext('dark')}

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const IntroGroup = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

export function AffiliateApplicationModal({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { i18n } = useLingui();

  return (
    <Modal
      ariaLabel={i18n._(msg`Creator application`)}
      className={formPanelClass}
      onClose={onClose}
      open={open}
    >
      <FormScope data-scheme="dark">
        <IntroGroup>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(AFFILIATE_APPLICATION_COPY.title)}
          </Heading>
          <Body muted size="md">
            {i18n._(AFFILIATE_APPLICATION_COPY.subtitle)}
          </Body>
        </IntroGroup>
        <AffiliateApplicationForm />
      </FormScope>
    </Modal>
  );
}
