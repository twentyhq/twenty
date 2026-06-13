'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useCallback, useRef } from 'react';

import { useScheduledOnScroll } from '@/platform/motion';
import { color, fontSize, mediaUp, spacing } from '@/tokens';
import { Eyebrow, GuideCrosshair, Heading } from '@/ui';

import { HelpedCard } from './helped-card';
import {
  applyHelpedSceneLayout,
  type HelpedSceneLayoutState,
} from './helped-scene-layout';
import { HELPED_CARDS } from './helped.data';

// Display treatment ported from the original: below md this headline runs
// larger than the xl ramp's floor and tracks the viewport. The old site
// fills lines naturally on a 688px measure (3 lines at desktop) — balance
// would redistribute it into 4 narrow ones, so this headline opts out.
const headlineMeasureClassName = css`
  margin-inline: auto;

  /* The old headline escapes its block's 16px gutter: its effective
     measure is the full 688 — without this the last two words wrap to a
     fourth line. */
  ${mediaUp('md')} {
    margin-inline: ${spacing(-4)};
  }

  /* h2[data-size] outranks the Heading component's [data-size='xl']
     ramp — a bare h2 selector silently loses that cascade (it did: the
     mobile clamp never applied; desktop masked it by agreeing at 80px). */
  h2[data-size] {
    font-size: clamp(${fontSize(8)}, 9.5vw, ${fontSize(15)});
    line-height: 1.1;
    text-wrap: wrap; /* balance opt-out: the display headline must fill 3 greedy lines like old */
  }

  ${mediaUp('md')} {
    max-width: 688px;

    h2[data-size] {
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

// The vertical guide spans the whole stage (the sticky panel's own line
// would end at the pinned viewport) and overshoots into the next section's
// notch cap so it meets the white card with no gap. The card's white fill
// starts at 19px (its 1px anti-seam overlap), so 19 exactly touches it.
const StageGuide = styled.div`
  display: none;

  ${mediaUp('md')} {
    background-color: ${color('black-10')};
    bottom: -19px;
    display: block;
    left: 50%;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 1px;
  }
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
  text-align: center;
  width: 100%;
  z-index: 1;

  & > * + * {
    margin-top: ${spacing(6)};
  }
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
      aria-label={i18n._(msg`Customer stories`)}
      id="homepage-cases"
      ref={sectionRef}
      role="region"
    >
      <StageGuide aria-hidden />
      <StickyInner ref={innerRef}>
        <GuideCrosshair crossX="50%" crossY="176px" verticalLines={false} />
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
