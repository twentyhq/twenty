'use client';

import { type ReactNode, useId, useRef, useState } from 'react';

import { Container, LinkButton } from '@/design-system/components';
import type { AppPreviewConfig } from '@/sections/AppPreview';
import { TabButtons } from '@/sections/Tabs/components/TabButtons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

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
const SCROLL_HEIGHT = '200vh';

const ScrollTrack = styled.section`
  position: relative;
  width: 100%;
`;

const StickyFrame = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - ${NAV_HEIGHT}px);
  justify-content: flex-start;
  overflow: hidden;
  padding-top: ${theme.spacing(7.5)};
  position: sticky;
  top: ${NAV_HEIGHT}px;
  transition: background-color 0.6s ease;
  width: 100%;

  &[data-phase='0'] {
    background-color: var(--color-white, #ffffff);
  }

  &[data-phase='1'] {
    background-color: var(--color-black, #141414);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(12)};
  }
`;

const PatternOverlay = styled.div`
  bottom: 0;
  height: 575px;
  left: 50%;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  transition: opacity 0.6s ease;
  width: 100%;
  z-index: 0;

  &[data-visible='true'] {
    opacity: 0.4;
  }
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
  row-gap: ${theme.spacing(3)};
  text-align: center;
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
  transition: color 0.6s ease;
  width: 100%;

  &[data-phase='0'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-phase='1'] {
    color: ${theme.colors.secondary.text[100]};
  }
`;

const ContentLayer = styled.div`
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.6s ease;

  &[data-active='true'] {
    opacity: 1;
    pointer-events: auto;
    position: relative;
  }
`;

const BodyText = styled.p`
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  max-width: 591px;
  transition: color 0.6s ease;
  width: 100%;

  &[data-phase='0'] {
    color: ${theme.colors.primary.text[60]};
  }

  &[data-phase='1'] {
    color: rgba(255, 255, 255, 0.7);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: 18px;
  }
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
  opacity: 1;
  position: absolute;
  transition: opacity 0.4s ease;

  &[data-visible='false'] {
    opacity: 0;
    pointer-events: none;
  }
`;

const TabsLayer = styled.div`
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.4s ease 0.2s;
  width: 100%;

  &[data-visible='true'] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const VisualWrapper = styled.div`
  flex: 1;
  min-height: 0;
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
  const phase = useHeroScrollProgress(trackRef);
  const [activeTab, setActiveTab] = useState(0);
  const idPrefix = useId();

  const activeScene = phase === 0 ? 0 : activeTab + 1;

  return (
    <ScrollTrack ref={trackRef} style={{ height: SCROLL_HEIGHT }}>
      <StickyFrame data-phase={phase}>
        <PatternOverlay data-visible={phase === 1 ? 'true' : 'false'}>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="100vw"
            src="/images/product/tabs/background.webp"
          />
        </PatternOverlay>
        <StyledContainer>
          <HeadingSlot data-phase={phase}>
            <ContentLayer data-active={phase === 0}>
              {introHeading}
            </ContentLayer>
            <ContentLayer data-active={phase === 1}>{aiHeading}</ContentLayer>
          </HeadingSlot>

          <BodyText data-phase={phase}>
            {phase === 0 ? introBody : aiBody}
          </BodyText>

          <ActionSlot>
            <CtaLayer data-visible={phase === 0 ? 'true' : 'false'}>
              <LinkButton
                color="secondary"
                href={ctaHref}
                label={ctaLabel}
                variant="contained"
              />
            </CtaLayer>
            <TabsLayer data-visible={phase === 1 ? 'true' : 'false'}>
              <TabButtons
                activeIndex={activeTab}
                idPrefix={idPrefix}
                onSelect={setActiveTab}
                tabs={tabs}
              />
            </TabsLayer>
          </ActionSlot>
        </StyledContainer>

        <VisualWrapper>
          <ProductVisual activeScene={activeScene} visual={visual} />
        </VisualWrapper>
      </StickyFrame>
    </ScrollTrack>
  );
}
