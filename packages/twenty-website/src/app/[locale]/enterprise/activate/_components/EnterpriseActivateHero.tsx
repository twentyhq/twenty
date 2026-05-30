import { msg } from '@lingui/core/macro';

import { Eyebrow, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { HeroBody, HeroHeading, HeroSection } from '@/templates/Hero';

export function EnterpriseActivateHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection scheme="muted">
      <Eyebrow>
        <HeadingPart fontFamily="sans">{i18n._(msg`Self-hosting`)}</HeadingPart>
      </Eyebrow>
      <HeroHeading>
        <HeadingPart fontFamily="serif">{i18n._(msg`Enterprise`)}</HeadingPart>{' '}
        <HeadingPart fontFamily="sans">{i18n._(msg`activation`)}</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={500}>
        {i18n._(
          msg`Your checkout is complete. Follow the steps below to copy your license key into your Twenty instance.`,
        )}
      </HeroBody>
    </HeroSection>
  );
}
