import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import {
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { FeatureCard } from './FeatureCard';
import { FEATURE_CARDS } from './feature-cards.data';

// Mobile reads the intro left-aligned; the centered composition only
// engages from md up (user-directed; the old site centered everywhere).
const centeredIntroClassName = css`
  ${mediaUp('md')} {
    justify-items: center;
    margin-inline: auto;
    max-width: 900px;
    text-align: center;
  }
`;

// minmax(0, 1fr) keeps the three columns equal regardless of any one
// card's min-content (ported rationale: a longer word would otherwise
// expand its track and break the aspect-locked frames' alignment).
const CardsGrid = styled.div`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: minmax(0, 1fr);
  margin-inline: auto;
  max-width: 480px;
  width: 100%;

  ${mediaUp('md')} {
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    grid-template-columns: none;
    max-width: none;
  }
`;

export function FeatureCards() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <SectionIntro className={centeredIntroClassName}>
          <Eyebrow>
            {i18n._(msg`Skip the clunky UX that always comes with custom.`)}
          </Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Make your GTM team happy with *a CRM they'll love*`)}
          </Heading>
        </SectionIntro>
        <CardsGrid>
          {FEATURE_CARDS.map((card) => (
            <FeatureCard card={card} key={card.illustration} />
          ))}
        </CardsGrid>
      </SectionStack>
    </SectionShell>
  );
}
