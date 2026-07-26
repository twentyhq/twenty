'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { spacing } from '@/tokens';
import { Body, Button, Heading } from '@/ui';

import { PARTNER_APPLICATION_COPY } from '../partner-application-copy';

const SuccessView = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Actions = styled.div`
  align-self: flex-end;
`;

export function PartnerApplicationSuccess({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const { i18n } = useLingui();

  return (
    <>
      <Heading as="h2" size="lg" weight="light">
        {i18n._(PARTNER_APPLICATION_COPY.successTitle)}
      </Heading>
      <SuccessView>
        <Body muted size="md">
          {i18n._(PARTNER_APPLICATION_COPY.successSubtitle)}
        </Body>
        <Actions>
          <Button
            label={i18n._(PARTNER_APPLICATION_COPY.successDone)}
            onClick={onDismiss}
            type="button"
            variant="filled"
          />
        </Actions>
      </SuccessView>
    </>
  );
}
