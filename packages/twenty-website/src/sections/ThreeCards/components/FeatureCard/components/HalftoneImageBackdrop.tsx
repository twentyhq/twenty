'use client';

import { styled } from '@linaria/react';
import { type RefObject, useRef } from 'react';
import { useHalftoneImageBackdrop } from '../hooks/use-halftone-image-backdrop';

import type { HalftoneImageBackdropConfig } from '../utils/halftone-image-backdrop-config';

const VisualMount = styled.div`
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type HalftoneImageBackdropProps = {
  active?: boolean;
  config: HalftoneImageBackdropConfig;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

export function HalftoneImageBackdrop({
  active = false,
  config,
  pointerTargetRef,
}: HalftoneImageBackdropProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useHalftoneImageBackdrop({
    active,
    config,
    mountRef,
    pointerTargetRef,
  });

  return <VisualMount aria-hidden ref={mountRef} />;
}
