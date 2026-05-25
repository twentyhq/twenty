'use client';

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Container, LinkButton } from '@/design-system/components';
import type { AppPreviewConfig } from '@/sections/AppPreview';
import { TabButton } from '@/sections/Tabs/components/TabButton';
import { TabButtons } from '@/sections/Tabs/components/TabButtons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { useProductHeroMenuSync } from './product-hero-menu-sync';
import { ProductBackgroundHalftone } from './ProductBackgroundHalftone';
import { ProductIntroHalftone } from './ProductIntroHalftone';
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

const ScrollTrack = styled.section`
  height: 200vh;
  position: relative;
  width: 100%;
`;

const StickyFrame = styled.div`
  height: calc(100vh - ${NAV_HEIGHT}px);
  height: calc(100dvh - ${NAV_HEIGHT}px);
  overflow: hidden;
  position: sticky;
  top: ${NAV_HEIGHT}px;
  width: 100%;

  background-color: #ffffff;
`;

const FullLayer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: flex-start;
  padding-top: ${theme.spacing(7.5)};
  position: absolute;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(12)};
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

const IntroBackground = styled.div`
  bottom: 0;
  left: -20%;
  overflow: clip;
  pointer-events: none;
  position: absolute;
  right: -20%;
  top: 0;
  z-index: 0;
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
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
  const { morphProgress, navProgress } = useHeroScrollProgress(trackRef);
  const menuSync = useProductHeroMenuSync();
  const [activeTab, setActiveTab] = useState(0);
  const [stackTargetMetrics, setStackTargetMetrics] = useState<
    StackTargetMetric[]
  >([]);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const stackAppearProgress = clamp((morphProgress - 0.08) / 0.12);
  const stackAlignProgress = clamp((morphProgress - 0.58) / 0.16);
  const stackSpreadProgress = clamp((morphProgress - 0.74) / 0.18);
  const selectorRevealProgress = clamp((morphProgress - 0.94) / 0.06);
  const selectorRevealReady = selectorRevealProgress > 0.96;
  const stackCards = tabs;

  const stackStyle = {
    '--hero-stack-opacity': String(stackAppearProgress),
    '--hero-stack-shift-y': `${(1 - stackAppearProgress) * 24}px`,
  } as CSSProperties;

  const stackBaseOffsets = [0, 8, 16, 24];
  const stackBaseScales = [1, 0.985, 0.97, 0.955];
  const stackSpreadMetrics =
    stackTargetMetrics.length === tabs.length ? stackTargetMetrics : null;
  const stackWidth = stackSpreadMetrics?.[0]?.width ?? null;
  const aiPlaybackEnabled = morphProgress >= 0.58;

  useEffect(() => {
    menuSync?.setMorphProgress(navProgress);
  }, [menuSync, navProgress]);

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

  return (
    <ScrollTrack ref={trackRef}>
      <StickyFrame>
        {/* BASE LAYER: INTRO */}
        <FullLayer
          style={{ backgroundColor: '#ffffff', transform: 'translateZ(0)' }}
        >
          <IntroBackground>
            <ProductIntroHalftone />
          </IntroBackground>
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
            <ProductVisual activeScene={0} visual={visual} />
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
          <PatternOverlay style={{ opacity: 1.0 }}>
            <ProductBackgroundHalftone />
          </PatternOverlay>
          <StyledContainer>
            <HeadingGroup>
              <HeadingSlot style={{ color: theme.colors.secondary.text[100] }}>
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
                  {stackCards.map((tab, index) => (
                    (() => {
                      const targetMetric = stackSpreadMetrics?.[index];
                      const width =
                        stackWidth != null && targetMetric != null
                          ? stackWidth +
                            (targetMetric.width - stackWidth) *
                              stackSpreadProgress
                          : stackWidth ?? targetMetric?.width;
                      const offset = targetMetric?.offset ?? 0;

                      return (
                        <StackedTabCard
                          key={index}
                          style={{
                            transform: `translate3d(calc(-50% + ${
                              offset * stackSpreadProgress
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
                    })()
                  ))}
                </StackedTabDeck>
              </CtaLayer>
            </ActionSlot>
          </StyledContainer>

          <VisualWrapper>
            <ProductVisual
              activeScene={activeTab + 1}
              playbackEnabled={aiPlaybackEnabled}
              visual={visual}
            />
          </VisualWrapper>
        </FullLayer>
      </StickyFrame>
    </ScrollTrack>
  );
}
