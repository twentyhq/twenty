'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { Body, Heading } from '@/ui';
import { spacing } from '@/tokens';

import { CLIENT_BRIEF_COPY } from '../client-brief-copy';

const SuccessView = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

export function ClientBriefSuccess() {
  const { i18n } = useLingui();

  return (
    <>
      <Heading as="h2" size="lg" weight="light">
        {i18n._(CLIENT_BRIEF_COPY.successTitle)}
      </Heading>
      <SuccessView>
        <Body muted size="md">
          {i18n._(CLIENT_BRIEF_COPY.successBody)}
        </Body>
      </SuccessView>
    </>
  );
}
