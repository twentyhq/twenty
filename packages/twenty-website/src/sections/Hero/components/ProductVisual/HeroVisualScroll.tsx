'use client';

import {
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Container, LinkButton } from '@/design-system/components';
import type { AppPreviewConfig } from '@/sections/AppPreview';
import { TabButtons } from '@/sections/Tabs/components/TabButtons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import {
  getHeroMenuColorMix,
  getHeroScrollColors,
  getHeroScrollMotion,
} from './hero-scroll-colors';
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

const ScrollTrack = styled.section`
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 200vh;
  }
`;

const StickyFrame = styled.div`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: calc(100vh - ${NAV_HEIGHT}px);
    overflow: hidden;
    position: sticky;
    top: ${NAV_HEIGHT}px;
  }
`;

const DarkColorOverlay = styled.div`
  background-color: #141414;
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
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

const ScrollPatternOverlay = styled(PatternOverlay)`
  @media (max-width: ${theme.breakpoints.md - 1}px) {
    display: none;
  }
`;

const StackedPatternOverlay = styled(PatternOverlay)`
  display: none;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    display: block;
  }
`;

const patternImageClassName = css`
  object-fit: cover;
`;

const HeroViewport = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
`;

const HeroTrack = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 100%;
    will-change: transform;
  }
`;

const HeroPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding-bottom: ${theme.spacing(6)};
  padding-top: ${theme.spacing(7.5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 100%;
    min-height: 0;
    padding-bottom: 0;
    padding-top: ${theme.spacing(12)};
  }
`;

const AiHeroPanel = styled(HeroPanel)`
  position: relative;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    background-color: #141414;
    overflow: hidden;
    padding-top: ${theme.spacing(10)};
  }
`;

const PanelContainer = styled(Container)`
  display: grid;
  flex-shrink: 0;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  row-gap: ${theme.spacing(3)};
  text-align: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    row-gap: ${theme.spacing(6)};
  }
`;

const PanelHeading = styled.div`
  max-width: 360px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

const PanelBody = styled.p`
  font-size: ${theme.font.size(4)};
  line-height: 1.55;
  margin: 0;
  max-width: 360px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 591px;
  }
`;

const IntroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: center;
  min-height: 48px;
  width: 100%;
`;

const TabsActions = styled.div`
  min-height: 48px;
  width: 100%;
`;

const PanelVisual = styled.div`
  overflow: hidden;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex: 1;
    min-height: 0;
  }
`;

const INTRO_PANEL_COLORS = getHeroScrollColors(0);
const AI_PANEL_COLORS = getHeroScrollColors(1);

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
  const heroViewportRef = useRef<HTMLDivElement>(null);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const menuSync = useProductHeroMenuSync();
  const { colorMix, isScrollDriven, panelMix } =
    useHeroScrollProgress(trackRef);
  const [activeTab, setActiveTab] = useState(0);
  const [panelStepPixels, setPanelStepPixels] = useState(0);
  const idPrefix = useId();

  const heroColors = getHeroScrollColors(colorMix);
  const heroMotion = getHeroScrollMotion(panelMix, panelStepPixels);
  const introPanelColors = isScrollDriven ? heroColors : INTRO_PANEL_COLORS;
  const aiPanelColors = isScrollDriven ? heroColors : AI_PANEL_COLORS;
  const isIntroInteractive = !isScrollDriven || panelMix < 0.5;
  const isAiInteractive = !isScrollDriven || panelMix >= 0.5;

  useLayoutEffect(() => {
    const heroViewport = heroViewportRef.current;

    if (!heroViewport || !isScrollDriven) {
      return;
    }

    const measureViewport = () => {
      setPanelStepPixels(heroViewport.clientHeight);
    };

    measureViewport();

    const resizeObserver = new ResizeObserver(measureViewport);
    resizeObserver.observe(heroViewport);

    return () => resizeObserver.disconnect();
  }, [aiBody, aiHeading, introBody, introHeading, isScrollDriven, tabs]);

  useEffect(() => {
    if (!menuSync) {
      return;
    }

    const updateMenuColorMix = () => {
      const track = trackRef.current;
      const trackRect = track?.getBoundingClientRect() ?? null;
      const aiPanelRect = aiPanelRef.current?.getBoundingClientRect() ?? null;

      menuSync.setMenuColorMix(
        getHeroMenuColorMix({
          aiPanelRect,
          colorMix,
          isScrollDriven,
          navHeight: NAV_HEIGHT,
          panelMix,
          trackRect,
          viewportHeight: window.innerHeight,
        }),
      );
    };

    updateMenuColorMix();
    window.addEventListener('scroll', updateMenuColorMix, { passive: true });
    window.addEventListener('resize', updateMenuColorMix);

    return () => {
      window.removeEventListener('scroll', updateMenuColorMix);
      window.removeEventListener('resize', updateMenuColorMix);
    };
  }, [colorMix, isScrollDriven, menuSync, panelMix]);

  return (
    <ScrollTrack ref={trackRef}>
      <StickyFrame>
        {isScrollDriven ? (
          <DarkColorOverlay
            style={{ opacity: heroColors.darkOverlayOpacity }}
          />
        ) : null}
        <ScrollPatternOverlay style={{ opacity: heroColors.patternOpacity }}>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="100vw"
            src="/images/product/tabs/background.webp"
          />
        </ScrollPatternOverlay>

        <HeroViewport ref={heroViewportRef}>
          <HeroTrack
            style={
              isScrollDriven && panelStepPixels > 0
                ? {
                    height: panelStepPixels * 2,
                    transform: `translate3d(0, ${heroMotion.trackTranslateY}px, 0)`,
                  }
                : undefined
            }
          >
            <HeroPanel
              style={
                isScrollDriven
                  ? {
                      color: introPanelColors.headingColor,
                      height: panelStepPixels > 0 ? panelStepPixels : undefined,
                    }
                  : { color: introPanelColors.headingColor }
              }
            >
              <PanelContainer>
                <PanelHeading>{introHeading}</PanelHeading>
                <PanelBody style={{ color: introPanelColors.bodyColor }}>
                  {introBody}
                </PanelBody>
                <IntroActions
                  style={{
                    pointerEvents: isIntroInteractive ? 'auto' : 'none',
                  }}
                >
                  <LinkButton
                    color="secondary"
                    href={ctaHref}
                    label={ctaLabel}
                    variant="contained"
                  />
                </IntroActions>
              </PanelContainer>
              <PanelVisual>
                <ProductVisual visual={visual} />
              </PanelVisual>
            </HeroPanel>

            <AiHeroPanel
              ref={aiPanelRef}
              style={
                isScrollDriven
                  ? {
                      color: aiPanelColors.headingColor,
                      height: panelStepPixels > 0 ? panelStepPixels : undefined,
                    }
                  : { color: aiPanelColors.headingColor }
              }
            >
              {!isScrollDriven ? (
                <StackedPatternOverlay style={{ opacity: 0.4 }}>
                  <NextImage
                    alt=""
                    className={patternImageClassName}
                    fill
                    sizes="100vw"
                    src="/images/product/tabs/background.webp"
                  />
                </StackedPatternOverlay>
              ) : null}
              <PanelContainer>
                <PanelHeading>{aiHeading}</PanelHeading>
                <PanelBody style={{ color: aiPanelColors.bodyColor }}>
                  {aiBody}
                </PanelBody>
                <TabsActions
                  style={{
                    pointerEvents: isAiInteractive ? 'auto' : 'none',
                  }}
                >
                  <TabButtons
                    activeIndex={activeTab}
                    idPrefix={idPrefix}
                    onSelect={setActiveTab}
                    tabs={tabs}
                  />
                </TabsActions>
              </PanelContainer>
              <PanelVisual>
                <ProductVisual activeScene={activeTab + 1} visual={visual} />
              </PanelVisual>
            </AiHeroPanel>
          </HeroTrack>
        </HeroViewport>
      </StickyFrame>
    </ScrollTrack>
  );
}
