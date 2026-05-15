'use client';

import { type ReactNode, useRef } from 'react';

import { Container, LinkButton } from '@/design-system/components';
import type { AppPreviewConfig } from '@/sections/AppPreview';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { ProductVisual } from './ProductVisual';
import { useHeroScrollProgress } from './use-hero-scroll-progress';

export type HeroScene = {
  body: string;
  heading: ReactNode;
};

const SCENE_COUNT = 4;
const NAV_HEIGHT = 64;

const ScrollTrack = styled.section`
  background-color: var(--color-white);
  position: relative;
  width: 100%;
`;

const StickyFrame = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100vh - ${NAV_HEIGHT}px);
  justify-content: flex-start;
  overflow: hidden;
  padding-top: ${theme.spacing(7.5)};
  position: sticky;
  top: ${NAV_HEIGHT}px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(12)};
  }
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  position: relative;
  text-align: center;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  row-gap: ${theme.spacing(3)};
  width: 100%;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const HeadingSlot = styled.div`
  max-width: 672px;
  min-height: 96px;
  position: relative;
  width: 100%;
`;

const HeadingLayer = styled.div`
  inset: 0;
  opacity: 0;
  position: absolute;
  transform: translateY(8px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;

  &[data-active='true'] {
    opacity: 1;
    position: relative;
    transform: translateY(0);
  }
`;

const BodySlot = styled.div`
  color: ${theme.colors.primary.text[60]};
  font-size: 16px;
  line-height: 1.5;
  max-width: 591px;
  min-height: 24px;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: 18px;
  }
`;

const BodyLayer = styled.span`
  inset: 0;
  opacity: 0;
  position: absolute;
  transform: translateY(6px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;

  &[data-active='true'] {
    opacity: 1;
    position: relative;
    transform: translateY(0);
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: center;
  transition: opacity 0.4s ease;
`;

const VisualWrapper = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
`;

type HeroVisualScrollProps = {
  ctaHref: string;
  ctaLabel: string;
  scenes: HeroScene[];
  visual: AppPreviewConfig;
};

export function HeroVisualScroll({
  ctaHref,
  ctaLabel,
  scenes,
  visual,
}: HeroVisualScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { sceneIndex } = useHeroScrollProgress(trackRef);

  return (
    <ScrollTrack
      ref={trackRef}
      style={{ height: `${SCENE_COUNT * 100}vh` }}
    >
      <StickyFrame>
        <StyledContainer>
          <HeadingSlot>
            {scenes.map((scene, index) => (
              <HeadingLayer data-active={index === sceneIndex} key={index}>
                {scene.heading}
              </HeadingLayer>
            ))}
          </HeadingSlot>

          <BodySlot>
            {scenes.map((scene, index) => (
              <BodyLayer data-active={index === sceneIndex} key={index}>
                {scene.body}
              </BodyLayer>
            ))}
          </BodySlot>

          <CtaRow style={{ opacity: sceneIndex === 0 ? 1 : 0 }}>
            <LinkButton
              color="secondary"
              href={ctaHref}
              label={ctaLabel}
              variant="contained"
            />
          </CtaRow>
        </StyledContainer>

        <VisualWrapper>
          <ProductVisual activeScene={sceneIndex} visual={visual} />
        </VisualWrapper>
      </StickyFrame>
    </ScrollTrack>
  );
}
