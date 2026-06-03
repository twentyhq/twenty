'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { LinkButton } from '@/design-system/components';
import { theme } from '@/theme';

// Where "Contact partner" enquiries are routed when a partner has no direct
// channel (calendar / LinkedIn) of their own.
const CONTACT_EMAIL = 'rashad@twenty.com';

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

// mailto: opens the visitor's mail client in place, so (unlike the external
// LinkButton) it must not force target="_blank", which would leave an orphan
// blank tab. Reuse the shared button styling via buttonBaseStyles + BaseButton.
const MailtoButton = styled.a`
  ${buttonBaseStyles}
`;

const isSafeHttpUrl = (raw: string) => {
  try {
    return ['https:', 'http:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};

type PartnerProfileCtasProps = {
  partnerName: string;
  calendarLink: string;
  linkedinUrl: string;
};

export function PartnerProfileCtas({
  partnerName,
  calendarLink,
  linkedinUrl,
}: PartnerProfileCtasProps) {
  const { i18n } = useLingui();
  const showCalendar = isSafeHttpUrl(calendarLink);
  const showLinkedin = isSafeHttpUrl(linkedinUrl);
  // No booking link → offer a direct "Contact <partner>" email instead.
  // LinkedIn, when present, still shows alongside either option.
  const showContactFallback = !showCalendar;

  // Pre-filled enquiry so the visitor can send with one tap. The two trailing
  // blank lines leave room to paste their project under the prompt.
  const subject = i18n._(msg`Interested in meeting ${partnerName}`);
  const body = `${i18n._(msg`Hey, I'm interested in meeting. Here's my project:`)}\n\n`;
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <CtasWrapper>
      <CtasEyebrow>{i18n._(msg`Reach out`)}</CtasEyebrow>
      <ButtonRow>
        {showCalendar && (
          <LinkButton
            color="secondary"
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
            variant="outlined"
          />
        )}
        {showContactFallback && (
          <MailtoButton
            data-color="secondary"
            data-size="regular"
            data-variant="contained"
            href={mailtoHref}
          >
            <BaseButton
              color="secondary"
              label={i18n._(msg`Contact ${partnerName}`)}
              variant="contained"
            />
          </MailtoButton>
        )}
      </ButtonRow>
    </CtasWrapper>
  );
}
