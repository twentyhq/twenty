import { styled } from '@linaria/react';

export const FooterBackgroundCanvasRoot = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  & canvas {
    display: block;
    width: 100%;
    height: 100%;
    mix-blend-mode: color-dodge;
  }
`;
