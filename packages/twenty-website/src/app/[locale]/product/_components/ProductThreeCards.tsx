import { Trans } from '@lingui/react/macro';

import { ILLUSTRATION_CARDS } from '@/app/[locale]/product/three-cards.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { IllustrationCards } from '@/sections/ThreeCards';
import { ThreeCardsIntro, ThreeCardsSection } from '@/templates/ThreeCards';

export function ProductThreeCards() {
  return (
    <ThreeCardsSection scheme="light">
      <ThreeCardsIntro align="left" maxWidthMd={600}>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            <Trans>Stop settling for trade-offs.</Trans>
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">A modern CRM with</HeadingPart>
            <HeadingPart fontFamily="sans">an intuitive interface</HeadingPart>
          </Trans>
        </Heading>
      </ThreeCardsIntro>
      <IllustrationCards illustrationCards={ILLUSTRATION_CARDS} />
    </ThreeCardsSection>
  );
}
