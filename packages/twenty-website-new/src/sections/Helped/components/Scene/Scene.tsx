'use client';

import { Eyebrow, GuideCrosshair, Heading } from '@/design-system/components';
import { HelpedSceneScrollLayoutEffect } from '@/sections/Helped/effect-components/HelpedSceneScrollLayoutEffect';
import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { Card } from '../Card/Card';

const GUIDE_INTERSECTION_TOP = '176px';

const helpedHeadingClassName = css`
  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 760px;
    white-space: pre-line;
  }

  [data-family='sans'] {
    white-space: nowrap;
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
  position: absolute;
  will-change: top, opacity;
`;

type SceneProps = {
  data: HelpedDataType;
};

export function Scene({ data }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <ScrollStage
      aria-label="Customer stories"
      id="homepage-cases"
      ref={sectionRef}
    >
      <HelpedSceneScrollLayoutEffect
        cardRefs={cardRefs}
        cards={data.cards}
        innerRef={innerRef}
        sectionRef={sectionRef}
      />
      <StickyInner ref={innerRef}>
        <GuideCrosshair crossX="50%" crossY={GUIDE_INTERSECTION_TOP} zIndex={0} />
        <HeadlineBlock>
          <EyebrowExitTarget data-helped-exit-target>
            <Eyebrow colorScheme="primary" heading={data.eyebrow.heading} />
          </EyebrowExitTarget>
          <Heading
            as="h2"
            className={helpedHeadingClassName}
            segments={data.heading}
            size="xl"
            weight="light"
          />
        </HeadlineBlock>
        <CardsLayer>
          {data.cards.map((card, index) => (
            <CardPositioner
              key={`${card.heading.text}-${index}`}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
            >
              <Card card={card} />
            </CardPositioner>
          ))}
        </CardsLayer>
      </StickyInner>
    </ScrollStage>
  );
}
