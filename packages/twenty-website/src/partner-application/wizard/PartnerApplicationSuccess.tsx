'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { CalEmbed } from '@/platform/cal/CalEmbed';
import {
  fontFamily,
  fontSize,
  FONT_WEIGHT,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading } from '@/ui';

import { PARTNER_INTRO_CAL } from '../partner-application-config';
import { PARTNER_APPLICATION_COPY } from '../partner-application-copy';
import { buildPartnerIntroPrefill } from '../partner-intro-prefill';

const SuccessView = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const EmbedFrame = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: hidden;
`;

const BookLater = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  padding: 0;
  text-transform: uppercase;
`;

export function PartnerApplicationSuccess({
  company,
  email,
  name,
  onDismiss,
}: {
  company: string;
  email: string;
  name: string;
  onDismiss: () => void;
}) {
  const { i18n } = useLingui();
  const prefill = buildPartnerIntroPrefill({ company, email, name });

  return (
    <>
      <Heading as="h2" size="lg" weight="light">
        {i18n._(PARTNER_APPLICATION_COPY.successTitle)}
      </Heading>
      <SuccessView>
        <Body muted size="md">
          {i18n._(PARTNER_APPLICATION_COPY.bookIntroSubtitle)}
        </Body>
        <EmbedFrame>
          <CalEmbed
            calLink={PARTNER_INTRO_CAL.link}
            layout="month_view"
            namespace={PARTNER_INTRO_CAL.namespace}
            prefill={prefill}
          />
        </EmbedFrame>
        <BookLater onClick={onDismiss} type="button">
          {i18n._(PARTNER_APPLICATION_COPY.bookLater)}
        </BookLater>
      </SuccessView>
    </>
  );
}
