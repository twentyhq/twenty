'use client';

import {
  Eyebrow,
  GuideCrosshair,
  Heading,
  HeadingPart,
} from '@/design-system/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useEffect, useRef } from 'react';
import { HelpedCard } from './HelpedCard';
import { HelpedSceneScrollLayoutEffect } from '../effect-components/HelpedSceneScrollLayoutEffect';
import type { HeadingCardType } from '../types/heading-card-type';
import { preloadHelpedVisualGeometries } from '../utils/preload-helped-visual-geometries';

const GUIDE_INTERSECTION_TOP = '176px';

const helpedHeadingClassName = css`
  &[data-size='xl'] {
    font-size: clamp(${theme.font.size(8)}, 9.5vw, ${theme.font.size(15)});
    line-height: 1.1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 760px;
    white-space: pre-line;

    &[data-size='xl'] {
      font-size: ${theme.font.size(20)};
      line-height: ${theme.lineHeight(21.5)};
    }

    [data-family='sans'] {
      white-space: nowrap;
    }
  }
`;

const ScrollStage = styled.section`
  height: 280vh;
  position: relative;
  width: 100%;
`;

const StickyInner = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-items: center;
  min-height: 100vh;
  overflow: hidden;
  position: sticky;
  top: 0;
`;

const HeadlineBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  max-width: 688px;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  row-gap: ${theme.spacing(6)};
  text-align: center;
  width: 100%;
  z-index: 1;
`;

const EyebrowExitTarget = styled.div`
  display: grid;
  justify-items: center;
`;

const CardsLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;

  & article {
    pointer-events: auto;
  }
`;

const CardPositioner = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  will-change: transform, opacity;
`;

type SceneProps = {
  cards: HeadingCardType[];
};

export function Scene({ cards }: SceneProps) {
  const { i18n } = useLingui();
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    void preloadHelpedVisualGeometries();
  }, []);

  return (
    <ScrollStage
      aria-label="Customer stories"
      id="homepage-cases"
      ref={sectionRef}
    >
      <HelpedSceneScrollLayoutEffect
        cardRefs={cardRefs}
        cards={cards}
        innerRef={innerRef}
        sectionRef={sectionRef}
      />
      <StickyInner ref={innerRef}>
        <GuideCrosshair
          crossX="50%"
          crossY={GUIDE_INTERSECTION_TOP}
          zIndex={0}
        />
        <HeadlineBlock>
          <EyebrowExitTarget data-helped-exit-target>
            <Eyebrow colorScheme="primary">
              <HeadingPart fontFamily="sans">
                {i18n._(msg`In production.`)}
              </HeadingPart>
            </Eyebrow>
          </EyebrowExitTarget>
          <Heading
            as="h2"
            className={helpedHeadingClassName}
            size="xl"
            weight="light"
          >
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Dev teams power`)}
              <br />
              {i18n._(msg`company-wide`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {i18n._(msg`change with Twenty`)}
            </HeadingPart>
          </Heading>
        </HeadlineBlock>
        <CardsLayer>
          {cards.map((card, index) => (
            <CardPositioner
              key={index}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
            >
              <HelpedCard card={card} />
            </CardPositioner>
          ))}
        </CardsLayer>
      </StickyInner>
    </ScrollStage>
  );
}
