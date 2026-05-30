import { msg } from '@lingui/core/macro';

import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { HeroBody, HeroHeading, HeroSection } from '@/sections/Hero';

export function CustomersCatalogHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection scheme="muted">
      <HeroHeading>
        <HeadingPart fontFamily="serif">
          {i18n._(msg`See how teams`)}
        </HeadingPart>
        <br />
        <HeadingPart fontFamily="serif">{i18n._(msg`build`)}</HeadingPart>{' '}
        <HeadingPart fontFamily="sans">{i18n._(msg`on Twenty`)}</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={550}>
        {i18n._(
          msg`Real stories from real teams about how they shaped Twenty to fit their workflow and accelerated their growth.`,
        )}
      </HeroBody>
    </HeroSection>
  );
}
