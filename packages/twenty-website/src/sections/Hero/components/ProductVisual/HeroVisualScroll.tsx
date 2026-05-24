'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Container, LinkButton } from '@/design-system/components';
import type { AppPreviewConfig } from '@/sections/AppPreview';
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
  tabs: TabType[];
  visual: AppPreviewConfig;
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
  min-height: 48px;
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
  tabs,
  visual,
}: HeroScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { morphProgress, navProgress } = useHeroScrollProgress(trackRef);
  const menuSync = useProductHeroMenuSync();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    menuSync?.setMorphProgress(navProgress);
  }, [menuSync, navProgress]);

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
              </CtaLayer>
              <CtaLayer
                data-active={false}
                style={{ opacity: 0, pointerEvents: 'none' }}
              >
                <TabButtons
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
                <TabButtons
                  activeIndex={activeTab}
                  idPrefix="product-hero-ai"
                  onSelect={setActiveTab}
                  tabs={tabs}
                />
              </CtaLayer>
            </ActionSlot>
          </StyledContainer>

          <VisualWrapper>
            <ProductVisual activeScene={activeTab + 1} visual={visual} />
          </VisualWrapper>
        </FullLayer>
      </StickyFrame>
    </ScrollTrack>
  );
}
