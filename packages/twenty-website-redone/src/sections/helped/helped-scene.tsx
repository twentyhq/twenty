'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useCallback, useRef } from 'react';

import { useScheduledOnScroll } from '@/platform/motion';
import { fontSize, mediaUp, spacing } from '@/tokens';
import { Eyebrow, GuideCrosshair, Heading } from '@/ui';

import { HelpedCard } from './helped-card';
import {
  applyHelpedSceneLayout,
  type HelpedSceneLayoutState,
} from './helped-scene-layout';
import { HELPED_CARDS } from './helped.data';

// Display treatment ported from the original: below md this headline runs
// larger than the xl ramp's floor and tracks the viewport.
const headlineMeasureClassName = css`
  h2 {
    font-size: clamp(${fontSize(8)}, 9.5vw, ${fontSize(15)});
    line-height: 1.1;
  }

  ${mediaUp('md')} {
    max-width: 760px;

    h2 {
      font-size: ${fontSize(20)};
      line-height: ${fontSize(21.5)};
    }
  }
`;

const ScrollStage = styled.div`
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
  padding-inline: ${spacing(4)};
  row-gap: ${spacing(6)};
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
  opacity: 0;
  position: absolute;
  top: 0;
  will-change: transform, opacity;
`;

export function HelpedScene() {
  const { i18n } = useLingui();
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layoutStateRef = useRef<HelpedSceneLayoutState>({
    measurements: null,
  });

  const runLayout = useCallback(() => {
    applyHelpedSceneLayout(
      { cardRefs, innerRef, sectionRef },
      HELPED_CARDS.length,
      layoutStateRef.current,
    );
  }, []);

  useScheduledOnScroll(runLayout);

  return (
    <ScrollStage
      aria-label="Customer stories"
      id="homepage-cases"
      ref={sectionRef}
      role="region"
    >
      <StickyInner ref={innerRef}>
        <GuideCrosshair crossX="50%" crossY="176px" />
        <HeadlineBlock>
          <EyebrowExitTarget data-helped-exit-target>
            <Eyebrow>{i18n._(msg`In production.`)}</Eyebrow>
          </EyebrowExitTarget>
          <div className={headlineMeasureClassName}>
            <Heading as="h2" size="xl" weight="light">
              {i18n._(msg`Dev teams power company-wide *change with Twenty*`)}
            </Heading>
          </div>
        </HeadlineBlock>
        <CardsLayer>
          {HELPED_CARDS.map((card, index) => (
            <CardPositioner
              key={card.wordmark}
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
