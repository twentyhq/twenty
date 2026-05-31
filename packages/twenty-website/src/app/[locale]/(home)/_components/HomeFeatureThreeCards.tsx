import { Trans } from '@lingui/react/macro';

import { FEATURE_CARDS } from '@/app/[locale]/(home)/three-cards-feature.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { FeatureCards } from '@/sections/ThreeCards';
import { ThreeCardsIntro, ThreeCardsSection } from '@/templates/ThreeCards';

export function HomeFeatureThreeCards() {
  return (
    <ThreeCardsSection scheme="light">
      <ThreeCardsIntro align="center" maxWidthMd={900}>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            <Trans>Skip the clunky UX that always comes with custom.</Trans>
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">
              Make your GTM team happy
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">with</HeadingPart>
            <HeadingPart fontFamily="sans">a CRM they'll love</HeadingPart>
          </Trans>
        </Heading>
      </ThreeCardsIntro>
      <FeatureCards featureCards={FEATURE_CARDS} />
    </ThreeCardsSection>
  );
}
