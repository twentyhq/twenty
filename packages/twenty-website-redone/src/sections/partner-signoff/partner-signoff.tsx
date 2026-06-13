import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Button, GuideCrosshair, Heading, SectionShell } from '@/ui';

// The closing sign-off is a tall, centred panel: at md it fills a fixed height
// and centres its content vertically; below md it falls back to plain vertical
// padding. The section owns its own spacing (flush), so the decorative guide
// crosshair can anchor to the full panel height.
//
// The subline measure is tuned to a clean two-line break — the old site forced
// it with a desktop-only <br>; the measure reproduces it without coupling a
// line break into the translation.
const SignoffStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-block: ${spacing(20)};
  text-align: center;

  ${mediaUp('md')} {
    justify-content: center;
    min-height: 759px;
    padding-block: 0;
  }
`;

const Subline = styled.div`
  margin-top: ${spacing(2)};
  max-width: 400px;
  width: 100%;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
  margin-top: ${spacing(6)};
`;

export function PartnerSignoff() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GuideCrosshair crossX="calc(50% + 334px)" crossY="198px" />}
      rhythm="flush"
      scheme="light"
    >
      <SignoffStack>
        <Heading as="h2" size="xl" weight="light">
          {i18n._(msg`Ready to grow\n*with Twenty?*`)}
        </Heading>
        <Subline>
          <Body muted size="sm">
            {i18n._(
              msg`Join our partner ecosystem and help businesses take control of their CRM.`,
            )}
          </Body>
        </Subline>
        <Actions>
          <Button label={i18n._(msg`Become a partner`)} variant="outlined" />
          <Button href="/partners/list" label={i18n._(msg`Find a partner`)} />
        </Actions>
      </SignoffStack>
    </SectionShell>
  );
}
