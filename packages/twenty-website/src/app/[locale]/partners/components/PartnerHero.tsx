import { Trans } from '@lingui/react/macro';

import { PartnerHeroCtas } from '@/app/[locale]/partners/components/PartnerApplication';
import { HeadingPart } from '@/design-system/components';
import { HeroBody, HeroCta, HeroHeading, HeroSection } from '@/templates/Hero';
import { PartnerVisual } from '@/sections/Hero';

export function PartnerHero() {
  return (
    <HeroSection scheme="light">
      <HeroHeading>
        <Trans>
          <HeadingPart fontFamily="serif">Become</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">our partner</HeadingPart>
        </Trans>
      </HeroHeading>
      <HeroBody maxWidthMd={500}>
        <Trans>
          We're building the #1 Open Source CRM, but we can't do it alone. Join
          our partner ecosystem and grow with us.
        </Trans>
      </HeroBody>
      <HeroCta>
        <PartnerHeroCtas />
      </HeroCta>
      <PartnerVisual />
    </HeroSection>
  );
}
