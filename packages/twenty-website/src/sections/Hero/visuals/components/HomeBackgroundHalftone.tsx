'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import { useHomeBackgroundHalftone } from '../hooks/use-home-background-halftone';

const StyledMount = styled.div<{ $isReady: boolean }>`
  height: calc(100% + 80px);
  inset: -40px;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  position: absolute;
  transition: opacity 600ms ease;
  width: calc(100% + 80px);
`;

export function HomeBackgroundHalftone() {
  const mountReference = useRef<HTMLDivElement>(null);
  const isReady = useHomeBackgroundHalftone({ mountRef: mountReference });

  return <StyledMount aria-hidden ref={mountReference} $isReady={isReady} />;
}
