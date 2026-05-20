'use client';

import { type RefObject } from 'react';

import { HalftoneImageBackdrop } from './HalftoneImageBackdrop';
import type { HalftoneImageBackdropConfig } from '../utils/halftone-image-backdrop-config';

const DEFAULT_IMAGE_URL =
  '/images/home/three-cards-feature/familiar-interface-gradient.webp';

const FAMILIAR_INTERFACE_BACKDROP_CONFIG: Omit<
  HalftoneImageBackdropConfig,
  'imageUrl'
> = {
  activeHoverX: 0.16,
  activeHoverY: 0.46,
  dashColor: '#777777',
  flipImageY: true,
  halftonePower: -0.3,
  halftoneScalePx: 18,
  halftoneWidth: 0.3,
  hoverDashColor: '#777777',
  hoverHalftoneRadius: 0.45,
  hoverLightIntensity: 0.85,
  hoverLightRadius: 0.6,
  imageContrast: 0.7,
  previewDistance: 4,
};

type FamiliarInterfaceGradientBackdropProps = {
  active?: boolean;
  imageUrl?: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

export function FamiliarInterfaceGradientBackdrop({
  active,
  imageUrl = DEFAULT_IMAGE_URL,
  pointerTargetRef,
}: FamiliarInterfaceGradientBackdropProps) {
  return (
    <HalftoneImageBackdrop
      active={active}
      config={{ ...FAMILIAR_INTERFACE_BACKDROP_CONFIG, imageUrl }}
      pointerTargetRef={pointerTargetRef}
    />
  );
}
