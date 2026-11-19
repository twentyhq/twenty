import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { FooterBackdrop } from '@/sections/footer/FooterBackdrop';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

// PROTOTYPE (direction B, dark header): the footer's charcoal backdrop on a
// black stage, closed by a straight edge.
// Keeps the footer's backdrop clear of the copy on wide screens.
const BackdropSlot = styled.div`
  inset: 0;
  position: absolute;

  ${mediaUp('md')} {
    left: 45%;
  }
`;

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

export function AppsDarkStage({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionShell
        background={
          <BackdropSlot>
            <FooterBackdrop />
          </BackdropSlot>
        }
        fullBleedBackground
        rhythm="hero"
        scheme="dark"
      >
        {children}
      </SectionShell>
    </>
  );
}

export function AppsMarketplaceHeaderDark() {
  const i18n = getServerI18n();

  return (
    <AppsDarkStage>
      <HeaderStack>
        <Eyebrow>{i18n._(msg`Marketplace`)}</Eyebrow>
        <Heading as="h1" size="lg" weight="light">
          {i18n._(msg`Apps for *Twenty*`)}
        </Heading>
        <HeaderBody>
          <Body muted size="md">
            {i18n._(
              msg`Extend your CRM with apps from Twenty and its community. Every app here is reviewed by our team for security and quality — install one in a click and it's live in your workspace.`,
            )}
          </Body>
        </HeaderBody>
      </HeaderStack>
    </AppsDarkStage>
  );
}
