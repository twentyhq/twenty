import { styled } from '@linaria/react';

export const FooterBackgroundCanvasRoot = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  & iframe {
    display: block;
    height: 100%;
    mix-blend-mode: color-dodge;
    width: 100%;
  }
`;
