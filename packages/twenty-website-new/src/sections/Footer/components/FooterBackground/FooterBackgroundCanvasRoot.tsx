import { styled } from '@linaria/react';

export const FooterBackgroundCanvasRoot = styled.div`
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
