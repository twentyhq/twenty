import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

const ZoneHeader = styled.div`
  max-width: 640px;
  /* Clears the fixed menu: without it an anchor jump parks the heading
     underneath the bar. */
  scroll-margin-top: ${spacing(22)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

type PartnerDirectoryProps = {
  children: ReactNode;
};

// The header stays outside the streamed slot: the anchor is a cross-page
// contract (the hero jump, the profile back link) and must be in the first
// paint, not only once the partners API resolves.
export function PartnerDirectory({ children }: PartnerDirectoryProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      {/* tabIndex -1 makes the zone a programmatic focus target, so the hero's
          "Browse partners" anchor moves the reading position and not just the
          viewport. */}
      <ZoneHeader id={PARTNER_DIRECTORY_ANCHOR_ID} tabIndex={-1}>
        <Eyebrow>{i18n._(msg`Directory`)}</Eyebrow>
        <Heading as="h2" size="lg" weight="light">
          {i18n._(msg`Browse the *certified partners*`)}
        </Heading>
        <Body muted size="md">
          {i18n._(
            msg`Filter by region, language, and specialty, then read a profile and book a call with the partner yourself.`,
          )}
        </Body>
      </ZoneHeader>
      {children}
    </SectionShell>
  );
}
