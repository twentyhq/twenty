import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

// Left-aligned page intro on the shared hero rhythm (the old marketplace
// header's larger one-off top padding normalizes onto rhythm="hero", the
// ratified rhythm system). The grid section follows on the same light surface.
const HeaderStack = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(6)};
    }
  }
`;

const HeaderBody = styled.div`
  max-width: 640px;
`;

export function MarketplaceHeader() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="hero" scheme="light">
      <HeaderStack>
        <Eyebrow>{i18n._(msg`Marketplace`)}</Eyebrow>
        <Heading as="h1" size="lg" weight="light">
          {i18n._(msg`Find your *Twenty partner*`)}
        </Heading>
        <HeaderBody>
          <Body muted size="md">
            {i18n._(
              msg`Twenty's certified partners help teams migrate, customise, and operate the open source CRM across regions, languages, and deployment models. Browse profiles and book a call.`,
            )}
          </Body>
        </HeaderBody>
      </HeaderStack>
    </SectionShell>
  );
}
