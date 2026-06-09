import { Trans } from '@lingui/react/macro';

import { HeadingPart } from '@/design-system/components';
import { HeroBody, HeroHeading, HeroSection } from '@/templates/Hero';

export function CustomersCatalogHero() {
  return (
    <HeroSection scheme="muted">
      <HeroHeading>
        <Trans>
          <HeadingPart fontFamily="serif">See how teams</HeadingPart>
          <br />
          <HeadingPart fontFamily="serif">build</HeadingPart>
          <HeadingPart fontFamily="sans">on Twenty</HeadingPart>
        </Trans>
      </HeroHeading>
      <HeroBody maxWidthMd={550}>
        <Trans>
          Real stories from real teams about how they shaped Twenty to fit their
          workflow and accelerated their growth.
        </Trans>
      </HeroBody>
    </HeroSection>
  );
}
