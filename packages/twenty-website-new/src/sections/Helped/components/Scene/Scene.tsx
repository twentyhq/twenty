'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import { Eyebrow, Heading } from '@/design-system/components';
import { HelpedSceneScrollLayoutEffect } from '@/sections/Helped/effect-components/HelpedSceneScrollLayoutEffect';
import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';
import { CARD_WIDTH_DESKTOP } from '@/sections/Helped/utils/helped-scene-layout';
import { theme } from '@/theme';
import { Card } from '../Card/Card';

const SCROLL_HEIGHT_VH = 420;

const ScrollStage = styled.section`
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
  width: min(${CARD_WIDTH_DESKTOP}px, calc(100% - ${theme.spacing(8)}));
  will-change: transform, opacity;
`;

type SceneProps = {
  data: HelpedDataType;
};

export function Scene({ data }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <ScrollStage
      aria-label="Customer stories"
      ref={sectionRef}
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
    >
      <HelpedSceneScrollLayoutEffect
        cardRefs={cardRefs}
        cards={data.cards}
        headlineRef={headlineRef}
        innerRef={innerRef}
        sectionRef={sectionRef}
      />
      <StickyInner ref={innerRef}>
        <HeadlineBlock ref={headlineRef}>
          <Eyebrow colorScheme="primary" heading={data.eyebrow.heading} />
          <Heading as="h2" segments={data.heading} size="xl" weight="light" />
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
