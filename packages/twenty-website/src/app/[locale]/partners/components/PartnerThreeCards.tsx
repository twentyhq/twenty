import { Trans } from '@lingui/react/macro';

import { PARTNER_ILLUSTRATION_CARDS } from '@/app/[locale]/partners/three-cards-illustration.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import {
  IllustrationCards,
  type ThreeCardsScrollLayoutOptions,
} from '@/sections/ThreeCards';
import { ThreeCardsIntro, ThreeCardsSection } from '@/templates/ThreeCards';

const SCROLL_LAYOUT_OPTIONS: ThreeCardsScrollLayoutOptions = {
  endEdgeRatio: 0.28,
  initialScale: 0.935,
  initialTranslateY: 132,
  opacityRamp: 0.28,
  stagger: 0.16,
};

export function PartnerThreeCards() {
  return (
    <ThreeCardsSection scheme="muted">
      <ThreeCardsIntro align="left">
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            <Trans>Which partner program is right for you?</Trans>
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">
              Find the program that fits your business
            </HeadingPart>
            <HeadingPart fontFamily="sans">
              and unlock new opportunities with Twenty
            </HeadingPart>
          </Trans>
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
