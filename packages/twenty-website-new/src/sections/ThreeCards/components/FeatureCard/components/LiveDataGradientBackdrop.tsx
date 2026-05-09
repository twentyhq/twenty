'use client';

import { type RefObject } from 'react';

import { HalftoneImageBackdrop } from './HalftoneImageBackdrop';
import type { HalftoneImageBackdropConfig } from '../utils/halftone-image-backdrop-config';

const DEFAULT_IMAGE_URL =
  '/images/home/three-cards-feature/live-data-gradient.webp';

const LIVE_DATA_BACKDROP_CONFIG: Omit<HalftoneImageBackdropConfig, 'imageUrl'> =
  {
    activeHoverX: 0.16,
    activeHoverY: 0.46,
    dashColor: '#777777',
    flipImageY: false,
    halftonePower: -0.2,
    halftoneScalePx: 28,
    halftoneWidth: 0.4,
    hoverDashColor: '#777777',
    hoverHalftoneRadius: 0.45,
    hoverLightIntensity: 0.85,
    hoverLightRadius: 0.6,
    imageContrast: 1,
    previewDistance: 4,
  };

type LiveDataGradientBackdropProps = {
  active?: boolean;
  imageUrl?: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

export function LiveDataGradientBackdrop({
  active,
  imageUrl = DEFAULT_IMAGE_URL,
  pointerTargetRef,
}: LiveDataGradientBackdropProps) {
  return (
    <HalftoneImageBackdrop
      active={active}
      config={{ ...LIVE_DATA_BACKDROP_CONFIG, imageUrl }}
      pointerTargetRef={pointerTargetRef}
    />
  );
}
