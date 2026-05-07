'use client';

import { msg } from '@lingui/core/macro';
import {
  Eyebrow,
  GuideCrosshair,
  Heading,
  HeadingPart,
} from '@/design-system/components';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import { HelpedSceneScrollLayoutEffect } from '@/sections/Helped/effect-components/HelpedSceneScrollLayoutEffect';
import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';
import { preloadHelpedVisualGeometries } from '@/sections/Helped/visuals/helped-visual-models';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import { Card } from './Card';

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
  data: HelpedDataType;
};

export function Scene({ data }: SceneProps) {
  const renderText = useRenderMessage();
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
        cards={data.cards}
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
            <Eyebrow
              colorScheme="primary"
              heading={data.eyebrow.heading}
              renderText={renderText}
            />
          </EyebrowExitTarget>
          <Heading
            as="h2"
            className={helpedHeadingClassName}
            size="xl"
            weight="light"
          >
            <HeadingPart fontFamily="serif">
              {renderText(msg`Dev teams power`)}
              <br />
              {renderText(msg`company-wide`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {renderText(msg`change with Twenty`)}
            </HeadingPart>
          </Heading>
        </HeadlineBlock>
        <CardsLayer>
          {data.cards.map((card, index) => (
            <CardPositioner
              key={`${card.heading.text}-${index}`}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
            >
              <Card card={card} renderText={renderText} />
            </CardPositioner>
          ))}
        </CardsLayer>
      </StickyInner>
    </ScrollStage>
  );
}
