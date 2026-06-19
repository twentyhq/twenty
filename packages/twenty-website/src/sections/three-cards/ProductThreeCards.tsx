import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp } from '@/tokens';
import {
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { CardsGrid } from './CardsGrid';
import { IllustrationCard } from './IllustrationCard';
import { PRODUCT_ILLUSTRATION_CARDS } from './product-three-cards-data';

const HeadingMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 600px;
  }
`;

// The product page's three-cards variant: same section grammar and card
// vocabulary as the home ThreeCards, its own copy and models, no body
// line and no attributions.
export function ProductThreeCards() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Stop settling for trade-offs.`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`A modern CRM with *an intuitive interface*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <CardsGrid>
          {PRODUCT_ILLUSTRATION_CARDS.map((card) => (
            <IllustrationCard card={card} key={card.illustration} />
          ))}
        </CardsGrid>
      </SectionStack>
    </SectionShell>
  );
}
