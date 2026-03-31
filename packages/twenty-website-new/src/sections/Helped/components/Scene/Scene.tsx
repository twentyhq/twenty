'use client';

import { Eyebrow, Heading } from '@/design-system/components';
import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef } from 'react';
import { Card } from '../Card/Card';

const SCROLL_HEIGHT_VH = 420;

const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE_MAX = 360;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function segmentProgress(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

function smoothstep01(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

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

  const updateLayout = useCallback(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isDesktop = window.matchMedia(
      `(min-width: ${theme.breakpoints.md}px)`,
    ).matches;

    const rect = section.getBoundingClientRect();
    const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = clamp01(-rect.top / scrollRange);

    const innerWidth = inner.offsetWidth;
    const innerHeight = inner.offsetHeight;
    const horizontalPad = 32;
    const cardW = Math.min(
      isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE_MAX,
      innerWidth - horizontalPad * 2,
    );

    if (headlineRef.current) {
      const headlineFade = smoothstep01((progress - 0.78) / 0.14);
      headlineRef.current.style.opacity = String(1 - headlineFade);
      headlineRef.current.style.transform = `translate3d(0, ${-headlineFade * 48}px, 0)`;
    }

    const timings = [
      { start: 0.06, end: 0.32 },
      { start: 0.24, end: 0.5 },
      { start: 0.42, end: 0.7 },
    ];

    data.cards.forEach((_, index) => {
      const node = cardRefs.current[index];
      if (!node) return;

      if (reducedMotion) {
        node.style.opacity = '1';
        node.style.transform = 'none';
        node.style.width = `${cardW}px`;
        if (isDesktop) {
          if (index === 0) {
            node.style.left = `${innerWidth - cardW - innerWidth * 0.04}px`;
            node.style.top = `${innerHeight * 0.1}px`;
          } else if (index === 1) {
            node.style.left = `${innerWidth * 0.04}px`;
            node.style.top = `${innerHeight * 0.34}px`;
          } else {
            node.style.left = `${(innerWidth - cardW) / 2}px`;
            node.style.top = `${innerHeight * 0.56}px`;
          }
        } else {
          node.style.left = `${(innerWidth - cardW) / 2}px`;
          node.style.top = `${innerHeight * 0.38 + index * 56}px`;
        }
        return;
      }

      const timing = timings[index] ?? timings[0];
      const t = smoothstep01(
        segmentProgress(progress, timing.start, timing.end),
      );

      node.style.width = `${cardW}px`;
      node.style.zIndex = String(10 + index);

      let finalLeft = 0;
      let finalTop = 0;

      if (isDesktop) {
        if (index === 0) {
          finalLeft = innerWidth - cardW - innerWidth * 0.035;
          finalTop = innerHeight * 0.08;
        } else if (index === 1) {
          finalLeft = innerWidth * 0.03;
          finalTop = innerHeight * 0.3;
        } else {
          finalLeft = (innerWidth - cardW) / 2;
          finalTop = innerHeight * 0.52;
        }
      } else {
        finalLeft = (innerWidth - cardW) / 2;
        finalTop = innerHeight * 0.36 + index * 0.06 * innerHeight;
      }

      const enterX = 0;
      const enterY = innerHeight * 0.34;

      const x = finalLeft + enterX * (1 - t);
      const y = finalTop + enterY * (1 - t);
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.opacity = String(clamp01(t * 1.15));
    });
  }, [data.cards]);

  useEffect(() => {
    updateLayout();
    const onScroll = () => {
      updateLayout();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateLayout]);

  return (
    <ScrollStage
      aria-label="Customer stories"
      ref={sectionRef}
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
    >
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
