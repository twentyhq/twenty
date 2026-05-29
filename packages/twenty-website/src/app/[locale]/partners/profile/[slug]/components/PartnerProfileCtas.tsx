'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { LinkButton } from '@/design-system/components';
import { theme } from '@/theme';

const CtasWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  width: 100%;
`;

const CtasEyebrow = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  width: 100%;
`;

const isSafeHttpUrl = (raw: string) => {
  try {
    return ['https:', 'http:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};

type PartnerProfileCtasProps = {
  calendarLink: string;
  linkedinUrl: string;
};

export function PartnerProfileCtas({
  calendarLink,
  linkedinUrl,
}: PartnerProfileCtasProps) {
  const { i18n } = useLingui();
  const showCalendar = isSafeHttpUrl(calendarLink);
  const showLinkedin = isSafeHttpUrl(linkedinUrl);

  if (!showCalendar && !showLinkedin) return null;

  return (
    <CtasWrapper>
      <CtasEyebrow>{i18n._(msg`Reach out`)}</CtasEyebrow>
      <ButtonRow>
        {showCalendar && (
          <LinkButton
            color="primary"
            href={calendarLink}
            label={i18n._(msg`Book a call`)}
            variant="contained"
          />
        )}
        {showLinkedin && (
          <LinkButton
            color="secondary"
            href={linkedinUrl}
            label={i18n._(msg`View on LinkedIn`)}
            variant="contained"
          />
        )}
      </ButtonRow>
    </CtasWrapper>
  );
}
