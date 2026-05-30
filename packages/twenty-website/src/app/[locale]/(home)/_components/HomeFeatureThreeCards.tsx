import { msg } from '@lingui/core/macro';

import { FEATURE_CARDS } from '@/app/[locale]/(home)/three-cards-feature.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { FeatureCards } from '@/sections/ThreeCards';
import { ThreeCardsIntro, ThreeCardsSection } from '@/templates/ThreeCards';

export function HomeFeatureThreeCards() {
  const i18n = getServerI18n();

  return (
    <ThreeCardsSection scheme="light">
      <ThreeCardsIntro align="center" maxWidthMd={900}>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            {i18n._(msg`Skip the clunky UX that always comes with custom.`)}
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Make your GTM team happy`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="serif">{i18n._(msg`with`)}</HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`a CRM they'll love`)}
          </HeadingPart>
        </Heading>
      </ThreeCardsIntro>
      <FeatureCards featureCards={FEATURE_CARDS} />
    </ThreeCardsSection>
  );
}
