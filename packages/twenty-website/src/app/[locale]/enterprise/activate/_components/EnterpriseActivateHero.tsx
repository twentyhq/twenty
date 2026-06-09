import { Trans } from '@lingui/react/macro';

import { Eyebrow, HeadingPart } from '@/design-system/components';
import { HeroBody, HeroHeading, HeroSection } from '@/templates/Hero';

export function EnterpriseActivateHero() {
  return (
    <HeroSection scheme="muted">
      <Eyebrow>
        <HeadingPart fontFamily="sans">
          <Trans>Self-hosting</Trans>
        </HeadingPart>
      </Eyebrow>
      <HeroHeading>
        <Trans>
          <HeadingPart fontFamily="serif">Enterprise</HeadingPart>
          <HeadingPart fontFamily="sans">activation</HeadingPart>
        </Trans>
      </HeroHeading>
      <HeroBody maxWidthMd={500}>
        <Trans>
          Your checkout is complete. Follow the steps below to copy your license
          key into your Twenty instance.
        </Trans>
      </HeroBody>
    </HeroSection>
  );
}
