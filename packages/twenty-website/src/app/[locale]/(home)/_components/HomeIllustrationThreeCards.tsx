import { Trans } from '@lingui/react/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { ILLUSTRATION_CARDS } from '@/app/[locale]/(home)/three-cards-illustration.data';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPart,
} from '@/design-system/components';
import { IllustrationCards } from '@/sections/ThreeCards';
import { ThreeCardsIntro, ThreeCardsSection } from '@/templates/ThreeCards';
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
  return (
    <ThreeCardsSection scheme="light">
      <ThreeCardsIntro align="left">
        <IntroContent>
          <IntroHeader>
            <Eyebrow>
              <HeadingPart fontFamily="sans">
                <Trans>Stop settling for trade-offs.</Trans>
              </HeadingPart>
            </Eyebrow>
            <Heading className={headingClassName} size="lg" weight="light">
              <Trans>
                <HeadingPart fontFamily="serif">
                  Assemble, iterate and adapt a robust CRM,
                </HeadingPart>
                <HeadingPart fontFamily="sans">
                  that's quick to flex
                </HeadingPart>
              </Trans>
            </Heading>
          </IntroHeader>
          <Body className={bodyClassName} size="sm">
            <Trans>
              Compose your CRM and internal apps with a single extensibility
              toolkit.
            </Trans>
          </Body>
        </IntroContent>
      </ThreeCardsIntro>
      <IllustrationCards illustrationCards={ILLUSTRATION_CARDS} />
    </ThreeCardsSection>
  );
}
