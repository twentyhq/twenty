'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { LinkButton } from '@/design-system/components';
import { theme } from '@/theme';

const Ctas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: center;
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
    <Ctas>
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
    </Ctas>
  );
}
