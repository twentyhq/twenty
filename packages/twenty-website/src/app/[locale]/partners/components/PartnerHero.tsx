import { msg } from '@lingui/core/macro';

import { PartnerHeroCtas } from '@/app/[locale]/partners/components/PartnerApplication';
import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import {
  HeroBody,
  HeroCta,
  HeroHeading,
  HeroSection,
  PartnerVisual,
} from '@/sections/Hero';

export function PartnerHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection scheme="light">
      <HeroHeading>
        <HeadingPart fontFamily="serif">{i18n._(msg`Become`)}</HeadingPart>
        <br />
        <HeadingPart fontFamily="sans">{i18n._(msg`our partner`)}</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={500}>
        {i18n._(
          msg`We're building the #1 Open Source CRM, but we can't do it alone. Join our partner ecosystem and grow with us.`,
        )}
      </HeroBody>
      <HeroCta>
        <PartnerHeroCtas />
      </HeroCta>
      <PartnerVisual />
    </HeroSection>
  );
}
