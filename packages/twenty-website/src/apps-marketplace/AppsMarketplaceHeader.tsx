import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

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

export function AppsMarketplaceHeader() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="hero" scheme="light">
      <HeaderStack>
        <Eyebrow>{i18n._(msg`Marketplace`)}</Eyebrow>
        <Heading as="h1" size="lg" weight="light">
          {i18n._(msg`Apps for *Twenty*`)}
        </Heading>
        <HeaderBody>
          <Body muted size="md">
            {i18n._(
              msg`Extend your CRM with apps built and maintained by Twenty. Every app here is vetted by our team — install one in a click and it's live in your workspace.`,
            )}
          </Body>
        </HeaderBody>
      </HeaderStack>
    </SectionShell>
  );
}
