import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, BREAKPOINT_PX } from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPair,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { CardsGrid } from './CardsGrid';
import { IllustrationCard } from './IllustrationCard';
import { ILLUSTRATION_CARDS } from './three-cards.data';

// This heading tracks its sans accents lighter than the global -0.04em —
// ported from the original.
const headingMeasureClassName = css`
  ${mediaUp('md')} {
    max-width: ${BREAKPOINT_PX.md}px;
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
              <Body muted size="sm">
                {i18n._(
                  msg`Compose your CRM and internal apps with a single extensibility toolkit.`,
                )}
              </Body>
            </BodyMeasure>
          </HeadingPair>
        </SectionIntro>
        <CardsGrid>
          {ILLUSTRATION_CARDS.map((card) => (
            <IllustrationCard card={card} key={card.illustration} />
          ))}
        </CardsGrid>
      </SectionStack>
    </SectionShell>
  );
}
