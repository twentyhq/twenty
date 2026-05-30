import { msg } from '@lingui/core/macro';

import { ILLUSTRATION_CARDS } from '@/app/[locale]/product/three-cards.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import {
  IllustrationCards,
  ThreeCardsIntro,
  ThreeCardsSection,
} from '@/sections/ThreeCards';

export function ProductThreeCards() {
  const i18n = getServerI18n();

  return (
    <ThreeCardsSection scheme="light">
      <ThreeCardsIntro align="left" maxWidthMd={600}>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            {i18n._(msg`Stop settling for trade-offs.`)}
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`A modern CRM with`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`an intuitive interface`)}
          </HeadingPart>
        </Heading>
      </ThreeCardsIntro>
      <IllustrationCards illustrationCards={ILLUSTRATION_CARDS} />
    </ThreeCardsSection>
  );
}
