'use client';

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Container, LinkButton } from '@/design-system/components';
import { useMediaQuery } from '@/lib/motion';
import type { AppPreviewConfig } from '@/sections/AppPreview';
import { TabButton } from '@/sections/Tabs/components/TabButton';
import { TabButtons } from '@/sections/Tabs/components/TabButtons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { useProductHeroMenuSync } from './product-hero-menu-sync';
import { ProductBackgroundHalftone } from './ProductBackgroundHalftone';
import { ProductVisual } from './ProductVisual';
import { useHeroScrollProgress } from './use-hero-scroll-progress';

export type HeroScrollProps = {
  aiBody: string;
  aiHeading: ReactNode;
  ctaHref: string;
  ctaLabel: string;
  introBody: string;
  introHeading: ReactNode;
  introSecondaryCta?: ReactNode;
  tabs: TabType[];
  visual: AppPreviewConfig;
};

type StackTargetMetric = {
  offset: number;
  width: number;
};

const NAV_HEIGHT = 64;

const MD_UP_QUERY = `(min-width: ${theme.breakpoints.md}px)`;
const AI_PANEL_ONLY_MAX_WIDTH = 599.98;

const PRODUCT_HERO_BACKGROUND_IMAGE =
  '/illustrations/generated/home-background-wheat.webp';

const INTRO_DASH_COLOR = '#4A38F5';
const AI_DASH_COLOR = '#ffffff';

const PatternOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const ScrollTrack = styled.section`
  height: 200vh;
  margin-top: -${NAV_HEIGHT}px;
  position: relative;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 0.02}px) {
    display: none;
  }
`;

const MobileRoot = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    display: none;
  }
`;

const StickyFrame = styled.div`
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: sticky;
  top: 0;
  width: 100%;

  background-color: #ffffff;
`;

const FullLayer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: flex-start;
  padding-top: 94px;
  position: absolute;
  row-gap: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: 112px;
  }
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  position: relative;
  row-gap: ${theme.spacing(8)};
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

const ContentLayer = styled.div`
  inset: 0;
  position: absolute;

  &[data-active='true'] {
    position: relative;
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
  min-height: 64px;
  position: relative;
  width: 100%;
`;

const CtaLayer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  inset: 0;
  justify-content: center;
  position: absolute;

  &[data-active='true'] {
    position: relative;
  }
`;

const MeasureTabButtons = styled(TabButtons)`
  width: 100%;

  @media (min-width: ${theme.breakpoints.lg}px) {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }
`;

const StackedTabDeck = styled.div`
  display: none;
  inset: 0;
  position: absolute;

  @media (min-width: ${theme.breakpoints.lg}px) {
    display: block;
  }
`;

const StackedTabCard = styled.div`
  left: 50%;
  max-width: min(500px, calc(100vw - 160px));
  opacity: var(--hero-stack-opacity, 0);
  position: absolute;
  top: 0;
  transform-origin: center top;
  transition: none;
  width: var(--hero-stack-width, auto);
  will-change: opacity, transform;

  & > button {
    background-color: ${theme.colors.secondary.background[100]};
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border: 1px solid ${theme.colors.secondary.border[10]};
    box-sizing: border-box;
    max-width: none;
    width: 100%;
  }
`;

const VisualWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const MobileSection = styled.section<{ $secondary?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: ${({ $secondary }) =>
    $secondary ? theme.spacing(12) : theme.spacing(7.5)};
  position: relative;
  row-gap: ${theme.spacing(6)};
  width: 100%;
`;

const MobileVisualWrapper = styled.div`
  isolation: isolate;
  overflow: hidden;
  padding-bottom: ${theme.spacing(16)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  position: relative;
  width: 100%;
`;

// Non-clipping layer that hosts the collaboration cursors so they can sit above
// the visual (like the desktop FullLayer); the inner wrapper still clips the bleed.
const MobileCursorLayer = styled.div`
  position: relative;
  width: 100%;
`;

export function HeroVisualScroll({
  aiBody,
  aiHeading,
  ctaHref,
  ctaLabel,
  introBody,
  introHeading,
  introSecondaryCta,
  tabs,
  visual,
}: HeroScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowButtonsRef = useRef<HTMLDivElement>(null);
  const { morphProgress, navProgress, menuBackground, menuElevated } =
    useHeroScrollProgress(trackRef);
  const menuSync = useProductHeroMenuSync();
  const isDesktop = useMediaQuery(MD_UP_QUERY, { serverFallback: true });
  // Below 600px the board + AI panel can't coexist, so the AI section becomes a
  // panel-only "Ask AI" view.
  const isPhone = useMediaQuery(`(max-width: ${AI_PANEL_ONLY_MAX_WIDTH}px)`, {
    serverFallback: false,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [introLayerEl, setIntroLayerEl] = useState<HTMLDivElement | null>(null);
  const [mobileIntroLayerEl, setMobileIntroLayerEl] =
    useState<HTMLDivElement | null>(null);
  const [stackTargetMetrics, setStackTargetMetrics] = useState<
    StackTargetMetric[]
  >([]);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const stackAppearProgress = clamp((morphProgress - 0.4) / 0.16);
  const stackAlignProgress = clamp((morphProgress - 0.62) / 0.04);
  const stackSpreadProgress = clamp((morphProgress - 0.66) / 0.27);
  const stackSpreadEasedProgress = 1 - Math.pow(1 - stackSpreadProgress, 2.6);
  const selectorRevealProgress = clamp((morphProgress - 0.94) / 0.06);
  const selectorRevealReady = selectorRevealProgress > 0.96;
  const stackCards = tabs;

  const stackStyle = {
    '--hero-stack-opacity': String(stackAppearProgress),
    '--hero-stack-shift-y': `${(1 - stackAppearProgress) * 16}px`,
  } as CSSProperties;

  const stackBaseOffsets = [0, 4, 8, 12];
  const stackBaseScales = [1, 0.99, 0.98, 0.97];
  const stackSpreadMetrics =
    stackTargetMetrics.length === tabs.length ? stackTargetMetrics : null;
  const stackWidth = stackSpreadMetrics?.[0]?.width ?? null;
  const aiPanelProgress = clamp((morphProgress - 0.45) / 0.25);
  const aiPlaybackEnabled = morphProgress >= 0.7;

  useEffect(() => {
    if (!menuSync) {
      return;
    }

    if (!isDesktop) {
      menuSync.setMenuState({
        backgroundColor: 'rgb(255, 255, 255)',
        disableElevation: false,
        scheme: 'primary',
      });
      return;
    }

    menuSync.setMenuState({
      backgroundColor: menuBackground,
      disableElevation: !menuElevated,
      scheme: navProgress >= 0.5 ? 'secondary' : 'primary',
    });
  }, [menuSync, isDesktop, navProgress, menuBackground, menuElevated]);

  const heroAtStart = morphProgress <= 0;

  useEffect(() => {
    if (heroAtStart) {
      setActiveTab(0);
    }
  }, [heroAtStart]);

  useEffect(() => {
    const updateStackTargets = () => {
      const rowContainer = rowButtonsRef.current;

      if (!(rowContainer instanceof HTMLElement)) {
        return;
      }

      const buttons = Array.from(rowContainer.querySelectorAll('button'));

      if (buttons.length !== tabs.length) {
        return;
      }

      const containerRect = rowContainer.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      setStackTargetMetrics(
        buttons.map((button) => {
          const rect = button.getBoundingClientRect();

          return {
            offset: rect.left + rect.width / 2 - containerCenter,
            width: rect.width,
          };
        }),
      );
    };

    updateStackTargets();

    window.addEventListener('resize', updateStackTargets);

    return () => {
      window.removeEventListener('resize', updateStackTargets);
    };
  }, [tabs]);

  const mobileLayout = (
    <MobileRoot>
      <MobileSection style={{ backgroundColor: '#ffffff' }}>
        <StyledContainer>
          <HeadingGroup>
            <HeadingSlot style={{ color: theme.colors.primary.text[100] }}>
              <ContentLayer data-active={true}>{introHeading}</ContentLayer>
            </HeadingSlot>
            <BodyText style={{ color: theme.colors.primary.text[60] }}>
              <ContentLayer data-active={true}>{introBody}</ContentLayer>
            </BodyText>
          </HeadingGroup>

          <ActionSlot>
            <CtaLayer data-active={true}>
              <LinkButton
                color="secondary"
                href={ctaHref}
                label={ctaLabel}
                variant="contained"
              />
              {introSecondaryCta}
            </CtaLayer>
          </ActionSlot>
        </StyledContainer>

        <MobileCursorLayer ref={setMobileIntroLayerEl}>
          <MobileVisualWrapper>
            <PatternOverlay style={{ opacity: 1.0, zIndex: -1 }}>
              {!isDesktop ? (
                <ProductBackgroundHalftone
                  dashColor={INTRO_DASH_COLOR}
                  hoverColor={INTRO_DASH_COLOR}
                  imageUrl={PRODUCT_HERO_BACKGROUND_IMAGE}
                />
              ) : null}
            </PatternOverlay>
            <ProductVisual
              activeScene={0}
              bleed
              collaborative
              compactCursorTour
              cursorActive={!isDesktop}
              cursorLayer={mobileIntroLayerEl}
              playbackEnabled={false}
              visual={visual}
            />
          </MobileVisualWrapper>
        </MobileCursorLayer>
      </MobileSection>

      <MobileSection $secondary style={{ backgroundColor: '#141414' }}>
        <StyledContainer>
          <HeadingGroup>
            <HeadingSlot style={{ color: theme.colors.secondary.text[100] }}>
              <ContentLayer data-active={true}>{aiHeading}</ContentLayer>
            </HeadingSlot>
            <BodyText style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <ContentLayer data-active={true}>{aiBody}</ContentLayer>
            </BodyText>
          </HeadingGroup>

          <ActionSlot>
            <CtaLayer data-active={true}>
              <TabButtons
                activeIndex={activeTab}
                idPrefix="product-hero-mobile"
                onSelect={setActiveTab}
                tabs={tabs}
              />
            </CtaLayer>
          </ActionSlot>
        </StyledContainer>

        <MobileVisualWrapper>
          <PatternOverlay style={{ opacity: 1.0, zIndex: -1 }}>
            {!isDesktop ? (
              <ProductBackgroundHalftone
                dashColor={AI_DASH_COLOR}
                hoverColor={AI_DASH_COLOR}
                imageUrl={PRODUCT_HERO_BACKGROUND_IMAGE}
              />
            ) : null}
          </PatternOverlay>
          <ProductVisual
            activeScene={activeTab + 1}
            compact
            panelOnly={isPhone}
            playbackEnabled={!isDesktop}
            visual={visual}
          />
        </MobileVisualWrapper>
      </MobileSection>
    </MobileRoot>
  );

  return (
    <>
      {mobileLayout}
      <ScrollTrack ref={trackRef}>
        <StickyFrame>
          {/* BASE LAYER: INTRO */}
          <FullLayer
            ref={setIntroLayerEl}
            style={{ backgroundColor: '#ffffff', transform: 'translateZ(0)' }}
          >
            <StyledContainer>
              <HeadingGroup>
                <HeadingSlot style={{ color: theme.colors.primary.text[100] }}>
                  <ContentLayer data-active={true}>{introHeading}</ContentLayer>
                  <ContentLayer data-active={false} style={{ opacity: 0 }}>
                    {aiHeading}
                  </ContentLayer>
                </HeadingSlot>
                <BodyText style={{ color: theme.colors.primary.text[60] }}>
                  <ContentLayer data-active={true}>{introBody}</ContentLayer>
                  <ContentLayer data-active={false} style={{ opacity: 0 }}>
                    {aiBody}
                  </ContentLayer>
                </BodyText>
              </HeadingGroup>

              <ActionSlot>
                <CtaLayer data-active={true}>
                  <LinkButton
                    color="secondary"
                    href={ctaHref}
                    label={ctaLabel}
                    variant="contained"
                  />
                  {introSecondaryCta}
                </CtaLayer>
                <CtaLayer
                  data-active={false}
                  style={{ opacity: 0, pointerEvents: 'none' }}
                >
                  <MeasureTabButtons
                    activeIndex={activeTab}
                    idPrefix="product-hero-intro"
                    onSelect={setActiveTab}
                    tabs={tabs}
                  />
                </CtaLayer>
              </ActionSlot>
            </StyledContainer>

            <VisualWrapper>
              <PatternOverlay style={{ opacity: 1.0, zIndex: -1 }}>
                {isDesktop ? (
                  <ProductBackgroundHalftone
                    dashColor={INTRO_DASH_COLOR}
                    hoverColor={INTRO_DASH_COLOR}
                    imageUrl={PRODUCT_HERO_BACKGROUND_IMAGE}
                  />
                ) : null}
              </PatternOverlay>
              <ProductVisual
                activeScene={0}
                collaborative
                compact
                cursorActive={morphProgress < 0.5}
                cursorLayer={introLayerEl}
                fill
                playbackEnabled={false}
                visual={visual}
              />
            </VisualWrapper>
          </FullLayer>

          {/* TOP LAYER: AI (Wipes up from bottom) */}
          <FullLayer
            style={{
              backgroundColor: '#141414',
              clipPath: `inset(${100 - morphProgress * 100}% 0 0 0)`,
              pointerEvents: morphProgress > 0.5 ? 'auto' : 'none',
              // Prevent text from rendering sub-pixel anti-aliasing differently than the base layer
              transform: 'translateZ(0)',
            }}
          >
            <StyledContainer>
              <HeadingGroup>
                <HeadingSlot
                  style={{ color: theme.colors.secondary.text[100] }}
                >
                  <ContentLayer data-active={false} style={{ opacity: 0 }}>
                    {introHeading}
                  </ContentLayer>
                  <ContentLayer data-active={true}>{aiHeading}</ContentLayer>
                </HeadingSlot>
                <BodyText style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <ContentLayer data-active={false} style={{ opacity: 0 }}>
                    {introBody}
                  </ContentLayer>
                  <ContentLayer data-active={true}>{aiBody}</ContentLayer>
                </BodyText>
              </HeadingGroup>

              <ActionSlot>
                <CtaLayer
                  data-active={false}
                  style={{ opacity: 0, pointerEvents: 'none' }}
                >
                  <LinkButton
                    color="secondary"
                    href={ctaHref}
                    label={ctaLabel}
                    variant="contained"
                  />
                </CtaLayer>
                <CtaLayer data-active={true}>
                  <MeasureTabButtons
                    activeIndex={activeTab}
                    containerRef={rowButtonsRef}
                    idPrefix="product-hero-ai-measure"
                    onSelect={setActiveTab}
                    tabs={tabs}
                  />
                  <StackedTabDeck
                    aria-hidden={selectorRevealReady ? undefined : 'true'}
                    style={{
                      ...stackStyle,
                      pointerEvents: selectorRevealReady ? 'auto' : 'none',
                    }}
                  >
                    {stackCards.map((tab, index) =>
                      (() => {
                        const targetMetric = stackSpreadMetrics?.[index];
                        const width =
                          stackWidth != null && targetMetric != null
                            ? stackWidth +
                              (targetMetric.width - stackWidth) *
                                stackSpreadEasedProgress
                            : (stackWidth ?? targetMetric?.width);
                        const offset = targetMetric?.offset ?? 0;

                        return (
                          <StackedTabCard
                            key={index}
                            style={{
                              transform: `translate3d(calc(-50% + ${
                                offset * stackSpreadEasedProgress
                              }px), ${
                                stackBaseOffsets[index] *
                                (1 - stackAlignProgress)
                              }px, 0) scale(${
                                stackBaseScales[index] +
                                (1 - stackBaseScales[index]) *
                                  stackAlignProgress
                              })`,
                              width: width ? `${width}px` : undefined,
                              zIndex: 4 - index,
                            }}
                          >
                            <TabButton
                              controls={`product-hero-ai-stack-panel-${index}`}
                              id={`product-hero-ai-stack-tab-${index}`}
                              isActive={
                                selectorRevealReady && index === activeTab
                              }
                              onSelect={() => setActiveTab(index)}
                              tab={tab}
                            />
                          </StackedTabCard>
                        );
                      })(),
                    )}
                  </StackedTabDeck>
                </CtaLayer>
              </ActionSlot>
            </StyledContainer>

            <VisualWrapper>
              <PatternOverlay style={{ opacity: 1.0, zIndex: -1 }}>
                {isDesktop ? (
                  <ProductBackgroundHalftone
                    dashColor={AI_DASH_COLOR}
                    hoverColor={AI_DASH_COLOR}
                    imageUrl={PRODUCT_HERO_BACKGROUND_IMAGE}
                  />
                ) : null}
              </PatternOverlay>
              <ProductVisual
                activeScene={activeTab + 1}
                aiPanelProgress={aiPanelProgress}
                compact
                fill
                playbackEnabled={aiPlaybackEnabled}
                visual={visual}
              />
            </VisualWrapper>
          </FullLayer>
        </StickyFrame>
      </ScrollTrack>
    </>
  );
}
