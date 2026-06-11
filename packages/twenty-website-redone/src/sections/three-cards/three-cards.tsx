import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n';
import { mediaUp, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPair,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { IllustrationCard } from './illustration-card';
import { ILLUSTRATION_CARDS } from './three-cards.data';

// This heading tracks its sans accents lighter than the global -0.04em —
// ported from the original.
const headingMeasureClassName = css`
  ${mediaUp('md')} {
    max-width: 921px;
  }

  [data-accent] {
    letter-spacing: -0.02em;
  }
`;

const BodyMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 571px;
  }
`;

// The scroll-entrance choreography of the old site (staggered card reveal)
// arrives with the motion/visual wave; the layout ships first.
const CardsGrid = styled.div`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: 1fr;
  /* Stacked cards hold near their authored width (443px shape) instead of
     stretching across tablets — same cap pattern as the problem stage. */
  margin-inline: auto;
  max-width: 480px;
  width: 100%;

  ${mediaUp('md')} {
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    grid-template-columns: none;
    max-width: none;
  }
`;

export function ThreeCards() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Stop settling for trade-offs.`)}</Eyebrow>
          <HeadingPair>
            <div className={headingMeasureClassName}>
              <Heading as="h2" size="lg" weight="light">
                {i18n._(
                  msg`Assemble, iterate and adapt a robust CRM, *that's quick to flex*`,
                )}
              </Heading>
            </div>
            <BodyMeasure>
              <Body size="sm">
                {i18n._(
                  msg`Compose your CRM and internal apps with a single extensibility toolkit.`,
                )}
              </Body>
            </BodyMeasure>
          </HeadingPair>
        </SectionIntro>
        <CardsGrid>
          {ILLUSTRATION_CARDS.map((card) => (
            <IllustrationCard card={card} key={card.caseStudySlug} />
          ))}
        </CardsGrid>
      </SectionStack>
    </SectionShell>
  );
}
