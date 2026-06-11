'use client';

import { styled } from '@linaria/react';
import { useLayoutEffect, useRef } from 'react';

import { createAnimationFrameLoop } from '@/platform/motion';
import { HalftoneModel } from '@/platform/visuals/rigs/halftone-model';
import { mediaUp } from '@/tokens';

import { FAQ_BACKDROP } from './faq-backdrop-config';

// The authored shell: clipped to the section's right edge, faded, lifted.
const BackdropShell = styled.div`
  bottom: 0;
  display: block;
  left: auto;
  /* Improvement over the old site (user-directed): the artwork dissolves
     toward the headline instead of hard-clipping mid-dash. */
  mask-image: linear-gradient(to right, transparent 0%, black 22%, black 100%);
  opacity: 0.45;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: -5%;
  top: 0;
  transform: translateY(-11%);
  width: min(70vw, 750px);

  ${mediaUp('md')} {
    right: -10%;
    transform: translateY(-12%);
    width: 60vw;
  }
`;

const CanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function FaqBackdrop() {
  const shellRef = useRef<HTMLDivElement | null>(null);

  // The shell's height freezes at mount and scales with the viewport ratio
  // (ported): mobile URL-bar resizes would otherwise re-frame the artwork
  // on every scroll.
  useLayoutEffect(() => {
    const shell = shellRef.current;
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

  return (
    <BackdropShell aria-hidden data-illustration="faq" ref={shellRef}>
      <CanvasMount>
        <HalftoneModel
          initialPose={FAQ_BACKDROP.initialPose}
          modelUrl={FAQ_BACKDROP.modelUrl}
          settings={FAQ_BACKDROP.settings}
        />
      </CanvasMount>
    </BackdropShell>
  );
}
