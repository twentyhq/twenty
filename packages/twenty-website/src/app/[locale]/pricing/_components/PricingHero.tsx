import { Trans } from '@lingui/react/macro';

import { HeadingPart } from '@/design-system/components';
import { HeroBody, HeroHeading, HeroSection } from '@/templates/Hero';

export function PricingHero() {
  return (
    <HeroSection scheme="muted">
      <HeroHeading>
        <Trans>
          <HeadingPart fontFamily="serif">Simple</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">Pricing</HeadingPart>
        </Trans>
      </HeroHeading>
      <HeroBody maxWidthMd={500}>
        <Trans>
          Start your free trial today
          <br />
          without credit card.
        </Trans>
      </HeroBody>
    </HeroSection>
  );
}
