import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { ILLUSTRATION_CARDS } from '@/app/[locale]/(home)/three-cards-illustration.data';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPart,
} from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import {
  IllustrationCards,
  ThreeCardsIntro,
  ThreeCardsSection,
} from '@/sections/ThreeCards';
import { theme } from '@/theme';

const IntroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};
  width: 100%;
`;

const IntroHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};
  width: 100%;
`;

const headingClassName = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: ${theme.layout.editorial};
  }

  [data-family='sans'] {
    letter-spacing: -0.02em;
  }
`;

const bodyClassName = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 571px;
  }
`;

export function HomeIllustrationThreeCards() {
  const i18n = getServerI18n();

  return (
    <ThreeCardsSection scheme="light">
      <ThreeCardsIntro align="left">
        <IntroContent>
          <IntroHeader>
            <Eyebrow>
              <HeadingPart fontFamily="sans">
                {i18n._(msg`Stop settling for trade-offs.`)}
              </HeadingPart>
            </Eyebrow>
            <Heading className={headingClassName} size="lg" weight="light">
              <HeadingPart fontFamily="serif">
                {i18n._(msg`Assemble, iterate and adapt a robust CRM,`)}
              </HeadingPart>{' '}
              <HeadingPart fontFamily="sans">
                {i18n._(msg`that's quick to flex`)}
              </HeadingPart>
            </Heading>
          </IntroHeader>
          <Body className={bodyClassName} size="sm">
            {i18n._(
              msg`Compose your CRM and internal apps with a single extensibility toolkit.`,
            )}
          </Body>
        </IntroContent>
      </ThreeCardsIntro>
      <IllustrationCards illustrationCards={ILLUSTRATION_CARDS} />
    </ThreeCardsSection>
  );
}
