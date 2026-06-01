'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import { useStepperBackgroundHalftone } from './use-stepper-background-halftone';

const OverlayRoot = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 1;
`;

type StepperBackgroundHalftoneProps = {
  imageUrl?: string;
};

export function StepperBackgroundHalftone({
  imageUrl = '/images/home/stepper/background.webp',
}: StepperBackgroundHalftoneProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useStepperBackgroundHalftone({ imageUrl, mountRef: mountReference });

  return <OverlayRoot aria-hidden ref={mountReference} />;
}
