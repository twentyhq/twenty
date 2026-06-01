'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import { useProductBackgroundHalftone } from './use-product-background-halftone';

const StyledMount = styled.div<{ $isReady: boolean }>`
  height: 100%;
  inset: 0;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  position: absolute;
  transition: opacity 600ms ease;
  width: 100%;
`;

type ProductBackgroundHalftoneProps = {
  dashColor?: string;
  hoverColor?: string;
  solidness?: number;
};

export function ProductBackgroundHalftone({
  dashColor,
  hoverColor,
  solidness,
}: ProductBackgroundHalftoneProps) {
  const mountReference = useRef<HTMLDivElement>(null);
  const isReady = useProductBackgroundHalftone({
    dashColor,
    hoverColor,
    mountRef: mountReference,
    solidness,
  });

  return <StyledMount aria-hidden ref={mountReference} $isReady={isReady} />;
}
