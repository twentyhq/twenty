'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { Container, LinkButton } from '@/design-system/components';
import type { AppPreviewConfig } from '@/sections/AppPreview';
import { TabButtons } from '@/sections/Tabs/components/TabButtons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { useProductHeroMenuSync } from './product-hero-menu-sync';
import { ProductVisual } from './ProductVisual';
import { useHeroScrollProgress } from './use-hero-scroll-progress';

export type HeroScrollProps = {
  aiBody: string;
  aiHeading: ReactNode;
  ctaHref: string;
  ctaLabel: string;
  introBody: string;
  introHeading: ReactNode;
  tabs: TabType[];
  visual: AppPreviewConfig;
};

const NAV_HEIGHT = 64;

const LIGHT_BG = '#ffffff';
const DARK_BG = '#141414';

function lerpColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): string {
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

const LIGHT_BG_RGB: [number, number, number] = [255, 255, 255];
const DARK_BG_RGB: [number, number, number] = [20, 20, 20];
const LIGHT_TEXT_RGB: [number, number, number] = [28, 28, 28];
const DARK_TEXT_RGB: [number, number, number] = [255, 255, 255];

const ScrollTrack = styled.section`
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 200vh;
  }
`;

const StickyFrame = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  padding-bottom: ${theme.spacing(6)};
  padding-top: ${theme.spacing(7.5)};
  width: 100%;

  &[data-phase='0'] {
    background-color: ${LIGHT_BG};
  }

  &[data-phase='1'] {
    background-color: ${DARK_BG};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    height: calc(100vh - ${NAV_HEIGHT}px);
    padding-bottom: 0;
    padding-top: ${theme.spacing(12)};
    position: sticky;
    top: ${NAV_HEIGHT}px;
    transition: none;
  }
`;

const PatternOverlay = styled.div`
  bottom: 0;
  height: 575px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  width: 100%;
  z-index: 0;
`;

const patternImageClassName = css`
  object-fit: cover;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  position: relative;
  row-gap: ${theme.spacing(6)};
  text-align: center;
  width: 100%;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const HeadingSlot = styled.div`
  max-width: 360px;
  min-height: 96px;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

const BodyText = styled.div`
  font-size: ${theme.font.size(4)};
  line-height: 1.55;
  margin: 0;
  max-width: 360px;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 591px;
  }
`;

const HeadingGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  width: 100%;
`;

const ActionSlot = styled.div`
  min-height: 48px;
  position: relative;
  width: 100%;
`;

const CtaLayer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: center;
`;

const TabsLayer = styled.div`
  width: 100%;
`;

const VisualWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

export function HeroVisualScroll({
  aiBody,
  aiHeading,
  ctaHref,
  ctaLabel,
  introBody,
  introHeading,
  tabs,
  visual,
}: HeroScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { morphProgress, navProgress, phase } = useHeroScrollProgress(trackRef);
  const menuSync = useProductHeroMenuSync();
  const [activeTab, setActiveTab] = useState(0);
  const idPrefix = useId();

  useEffect(() => {
    menuSync?.setMorphProgress(navProgress);
  }, [menuSync, navProgress]);

  const activeScene = phase === 0 ? 0 : activeTab + 1;

  const backgroundColor = lerpColor(LIGHT_BG_RGB, DARK_BG_RGB, morphProgress);
  const headingColor = lerpColor(LIGHT_TEXT_RGB, DARK_TEXT_RGB, morphProgress);
  const bodyColor = `rgba(${Math.round(28 + (255 - 28) * morphProgress)}, ${Math.round(28 + (255 - 28) * morphProgress)}, ${Math.round(28 + (255 - 28) * morphProgress)}, ${0.6 + 0.1 * morphProgress})`;
  const patternOpacity = morphProgress * 0.4;

  return (
    <ScrollTrack ref={trackRef}>
      <StickyFrame
        data-phase={phase}
        style={{ backgroundColor }}
      >
        <PatternOverlay style={{ opacity: patternOpacity }}>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="100vw"
            src="/images/product/tabs/background.webp"
          />
        </PatternOverlay>
        <StyledContainer>
          <HeadingGroup>
            <HeadingSlot style={{ color: headingColor }}>
              {phase === 0 ? introHeading : aiHeading}
            </HeadingSlot>

            <BodyText style={{ color: bodyColor }}>
              {phase === 0 ? introBody : aiBody}
            </BodyText>
          </HeadingGroup>

          <ActionSlot>
            {phase === 0 ? (
              <CtaLayer style={{ position: 'relative' }}>
                <LinkButton
                  color="secondary"
                  href={ctaHref}
                  label={ctaLabel}
                  variant="contained"
                />
              </CtaLayer>
            ) : (
              <TabsLayer>
                <TabButtons
                  activeIndex={activeTab}
                  idPrefix={idPrefix}
                  onSelect={setActiveTab}
                  tabs={tabs}
                />
              </TabsLayer>
            )}
          </ActionSlot>
        </StyledContainer>

        <VisualWrapper>
          <ProductVisual activeScene={activeScene} visual={visual} />
        </VisualWrapper>
      </StickyFrame>
    </ScrollTrack>
  );
}
