'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import { useFooterBackground } from './use-footer-background';

const FooterBackgroundCanvasRoot = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  & canvas {
    display: block;
    height: 100%;
    pointer-events: auto;
    width: 100%;
  }
`;

const FooterVisualCanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function FooterBackground() {
  const mountReference = useRef<HTMLDivElement>(null);

  useFooterBackground({ mountRef: mountReference });

  return (
    <FooterBackgroundCanvasRoot aria-hidden>
      <FooterVisualCanvasMount ref={mountReference} />
    </FooterBackgroundCanvasRoot>
  );
}
