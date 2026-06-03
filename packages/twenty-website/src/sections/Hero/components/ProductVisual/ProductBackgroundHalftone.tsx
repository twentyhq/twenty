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
  imageUrl: string;
  dashColor?: string;
  hoverColor?: string;
};

export function ProductBackgroundHalftone({
  imageUrl,
  dashColor,
  hoverColor,
}: ProductBackgroundHalftoneProps) {
  const mountReference = useRef<HTMLDivElement>(null);
  const isReady = useProductBackgroundHalftone({
    imageUrl,
    dashColor,
    hoverColor,
    mountRef: mountReference,
  });

  return <StyledMount aria-hidden ref={mountReference} $isReady={isReady} />;
}
