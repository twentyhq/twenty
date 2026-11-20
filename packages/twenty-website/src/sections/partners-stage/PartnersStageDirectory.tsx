import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

// scroll-margin clears the fixed menu on the hero's anchor jump.
const ZoneHeader = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: minmax(0, 1fr);
  scroll-margin-top: ${spacing(22)};

  ${mediaUp('md')} {
    align-items: end;
    gap: ${spacing(12)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
  }
`;

const TitleStack = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const BodyMeasure = styled.div`
  ${mediaUp('md')} {
    padding-bottom: ${spacing(2)};
  }
`;

type PartnersStageDirectoryProps = {
  children: ReactNode;
};

// PROTOTYPE
// Header outside the streamed slot: the anchor must be in the first paint.
export function PartnersStageDirectory({
  children,
}: PartnersStageDirectoryProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <ZoneHeader id={PARTNER_DIRECTORY_ANCHOR_ID} tabIndex={-1}>
        <TitleStack>
          <Eyebrow>{i18n._(msg`Directory`)}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Browse the *certified partners*`)}
          </Heading>
        </TitleStack>
        <BodyMeasure>
          <Body muted size="md">
            {i18n._(
              msg`Filter by region, language, and specialty, then read a profile and book a call with the partner yourself.`,
            )}
          </Body>
        </BodyMeasure>
      </ZoneHeader>
      {children}
    </SectionShell>
  );
}
