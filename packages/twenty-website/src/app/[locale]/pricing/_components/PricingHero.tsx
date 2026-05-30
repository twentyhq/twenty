import { msg } from '@lingui/core/macro';

import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { HeroBody, HeroHeading, HeroSection } from '@/sections/Hero';

export function PricingHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection scheme="muted">
      <HeroHeading>
        <HeadingPart fontFamily="serif">{i18n._(msg`Simple`)}</HeadingPart>
        <br />
        <HeadingPart fontFamily="sans">{i18n._(msg`Pricing`)}</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={500} preserveLineBreaks>
        {i18n._(msg`Start your free trial today\nwithout credit card.`)}
      </HeroBody>
    </HeroSection>
  );
}
