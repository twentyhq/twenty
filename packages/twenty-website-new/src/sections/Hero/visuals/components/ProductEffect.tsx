'use client';

import { HalftoneModelCanvas } from '@/lib/halftone';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  PRODUCT_EFFECT_INITIAL_POSE,
  PRODUCT_EFFECT_MODEL_URL,
  PRODUCT_EFFECT_PREVIEW_DISTANCE,
  PRODUCT_EFFECT_SETTINGS,
  PRODUCT_EFFECT_VIRTUAL_RENDER_HEIGHT,
} from '../utils/product-effect-config';

const StyledVisualMount = styled.div`
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type ProductEffectProps = {
  modelUrl?: string;
  style?: CSSProperties;
};

export function ProductEffect({
  modelUrl = PRODUCT_EFFECT_MODEL_URL,
  style,
}: ProductEffectProps) {
  return (
    <StyledVisualMount aria-hidden style={style}>
      <HalftoneModelCanvas
        initialPose={PRODUCT_EFFECT_INITIAL_POSE}
        modelLabel="hero.glb"
        modelUrl={modelUrl}
        previewDistance={PRODUCT_EFFECT_PREVIEW_DISTANCE}
        settings={PRODUCT_EFFECT_SETTINGS}
        virtualRenderHeight={PRODUCT_EFFECT_VIRTUAL_RENDER_HEIGHT}
      />
    </StyledVisualMount>
  );
}
