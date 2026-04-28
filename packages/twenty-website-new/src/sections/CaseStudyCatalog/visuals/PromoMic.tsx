'use client';

import { HalftoneImageCanvas } from '@/lib/halftone';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  PROMO_MIC_IMAGE_FIT,
  PROMO_MIC_IMAGE_URL,
  PROMO_MIC_INITIAL_POSE,
  PROMO_MIC_PREVIEW_DISTANCE,
  PROMO_MIC_SETTINGS,
} from './promo-mic-config';

const StyledVisualMount = styled.div`
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type PromoMicProps = {
  imageUrl?: string;
  style?: CSSProperties;
};

export function PromoMic({
  imageUrl = PROMO_MIC_IMAGE_URL,
  style,
}: PromoMicProps) {
  return (
    <StyledVisualMount aria-hidden style={style}>
      <HalftoneImageCanvas
        crossOrigin="anonymous"
        imageFit={PROMO_MIC_IMAGE_FIT}
        imageUrl={imageUrl}
        initialPose={PROMO_MIC_INITIAL_POSE}
        previewDistance={PROMO_MIC_PREVIEW_DISTANCE}
        settings={PROMO_MIC_SETTINGS}
      />
    </StyledVisualMount>
  );
}

export default PromoMic;
