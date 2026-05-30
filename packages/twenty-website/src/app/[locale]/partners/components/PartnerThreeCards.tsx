import { msg } from '@lingui/core/macro';

import { PARTNER_ILLUSTRATION_CARDS } from '@/app/[locale]/partners/three-cards-illustration.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import {
  IllustrationCards,
  ThreeCardsIntro,
  ThreeCardsSection,
  type ThreeCardsScrollLayoutOptions,
} from '@/sections/ThreeCards';

const SCROLL_LAYOUT_OPTIONS: ThreeCardsScrollLayoutOptions = {
  endEdgeRatio: 0.28,
  initialScale: 0.935,
  initialTranslateY: 132,
  opacityRamp: 0.28,
  stagger: 0.16,
};

export function PartnerThreeCards() {
  const i18n = getServerI18n();

  return (
    <ThreeCardsSection scheme="muted">
      <ThreeCardsIntro align="left">
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            {i18n._(msg`Which partner program is right for you?`)}
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Find the program that fits your business`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`and unlock new opportunities with Twenty`)}
          </HeadingPart>
        </Heading>
      </ThreeCardsIntro>
      <IllustrationCards
        illustrationCards={PARTNER_ILLUSTRATION_CARDS}
        layoutOptions={SCROLL_LAYOUT_OPTIONS}
        variant="simple"
      />
    </ThreeCardsSection>
  );
}
