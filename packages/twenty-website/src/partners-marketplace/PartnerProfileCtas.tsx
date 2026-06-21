'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { spacing } from '@/tokens';
import { Button } from '@/ui';

import { isSafeHttpUrl } from './is-safe-http-url';
import { ProfileEyebrow } from './ProfileEyebrow';

// Where "Contact partner" enquiries route when a partner has no direct channel
// (calendar / LinkedIn) of their own.
const CONTACT_EMAIL = 'rashad@twenty.com';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;

  & > * {
    display: flex;
    width: 100%;
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

export function PartnerProfileCtas({
  partnerName,
  calendarLink,
  linkedinUrl,
}: {
  partnerName: string;
  calendarLink: string;
  linkedinUrl: string;
}) {
  const { i18n } = useLingui();
  const showCalendar = isSafeHttpUrl(calendarLink);
  const showLinkedin = isSafeHttpUrl(linkedinUrl);
  // No booking link → offer a direct "Contact <partner>" email instead;
  // LinkedIn, when present, still shows alongside either option.
  const showContactFallback = !showCalendar;

  // Pre-filled enquiry so the visitor can send in one tap; the two trailing
  // blank lines leave room to paste their project under the prompt.
  const subject = i18n._(msg`Interested in meeting ${partnerName}`);
  const body = `${i18n._(msg`Hey, I'm interested in meeting. Here's my project:`)}\n\n`;
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <Wrapper>
      <ProfileEyebrow>{i18n._(msg`Reach out`)}</ProfileEyebrow>
      <ButtonStack>
        {showCalendar && (
          <Button
            href={calendarLink}
            label={i18n._(msg`Book a call`)}
            variant="filled"
          />
        )}
        {showLinkedin && (
          <Button
            href={linkedinUrl}
            label={i18n._(msg`View on LinkedIn`)}
            variant="outlined"
          />
        )}
        {showContactFallback && (
          <Button
            href={mailtoHref}
            label={i18n._(msg`Contact ${partnerName}`)}
            variant="filled"
          />
        )}
      </ButtonStack>
    </Wrapper>
  );
}
