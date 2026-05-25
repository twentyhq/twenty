'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useLayoutEffect, useRef } from 'react';
import { createAnimationFrameLoop } from '@/lib/animation';
import { useFaqBackground } from './use-faq-background';

const FaqVisualShell = styled.div`
  bottom: 0;
  display: block;
  left: auto;
  opacity: 0.45;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: -5%;
  top: 0;
  transform: translateY(-11%);
  width: min(70vw, 750px);

  @media (min-width: ${theme.breakpoints.md}px) {
    right: -10%;
    transform: translateY(-12%);
    width: 60vw;
  }
`;

const FaqVisualCanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function FaqBackground() {
  const mountReference = useRef<HTMLDivElement>(null);
  const shellReference = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const shell = shellReference.current;

    if (!shell) {
      return;
    }

    const initialHeight = shell.clientHeight;

    if (initialHeight === 0) {
      return;
    }

    const initialViewportHeight = window.innerHeight || initialHeight;

    shell.style.bottom = 'auto';
    shell.style.height = `${initialHeight}px`;

    const resizeTask = createAnimationFrameLoop({
      onFrame: () => {
        const currentViewportHeight =
          window.innerHeight || initialViewportHeight;
        const ratio = currentViewportHeight / initialViewportHeight;
        shell.style.height = `${Math.round(initialHeight * ratio)}px`;
        return false;
      },
    });

    const handleWindowResize = () => {
      resizeTask.stop();
      resizeTask.start();
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      resizeTask.stop();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useFaqBackground({ mountRef: mountReference });

  return (
    <FaqVisualShell ref={shellReference}>
      <FaqVisualCanvasMount aria-hidden ref={mountReference} />
    </FaqVisualShell>
  );
}
