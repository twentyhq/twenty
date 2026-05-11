'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import { usePartnerHalftoneOverlay } from './use-partner-halftone-overlay';

const OverlayMount = styled.div`
  inset: 0;
  position: absolute;
  z-index: 1;
`;

type PartnerHalftoneOverlayProps = {
  imageUrl: string;
};

export function PartnerHalftoneOverlay({
  imageUrl,
}: PartnerHalftoneOverlayProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  usePartnerHalftoneOverlay({ imageUrl, mountRef });

  return <OverlayMount ref={mountRef} />;
}
