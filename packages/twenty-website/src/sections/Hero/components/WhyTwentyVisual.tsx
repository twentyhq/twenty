'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { WhyTwenty } from '@/sections/Hero/visuals/components/WhyTwenty';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const VisualContainer = styled.div`
  border-radius: ${theme.radius(1)};
  height: 462px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BackgroundLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 0;
`;

const ForegroundLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 1;
`;

const backgroundImageClassName = css`
  object-fit: cover;
  object-position: center;
`;

export function WhyTwentyVisual() {
  return (
    <VisualContainer>
      <BackgroundLayer>
        <NextImage
          alt="Why Twenty hero background"
          className={backgroundImageClassName}
          fill
          priority
          sizes="100vw"
          src="/images/why-twenty/hero/background.webp"
        />
      </BackgroundLayer>
      <ForegroundLayer>
        <WebGlMount priority>
          <WhyTwenty />
        </WebGlMount>
      </ForegroundLayer>
    </VisualContainer>
  );
}
