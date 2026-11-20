'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { DURATION, REDUCED_MOTION } from '@/tokens';

import { PROGRAM_HERO_BACKDROP_SETTINGS } from './program-hero-backdrop-settings';

// The scene stays nearly pinned and darkens through brightness over 800px.
const HERO_EXIT_SCROLL_PX = 800;

// The bottom edge fades out with a mask so the field ends softly.
const Root = styled.div`
  inset: 0;
  mask-image: linear-gradient(to bottom, black 70%, transparent);

  /* A light photo that fills the field reads too loud at full strength. */
  &[data-faint] {
    opacity: 0.45;
  }

  overflow: hidden;
  pointer-events: none;
  position: absolute;
`;

// Bleeds past the edges so the dash field has no seam (home hero).
const BackdropMount = styled.div<{ $isReady: boolean }>`
  animation-fill-mode: both;
  animation-name: program-hero-drift;
  animation-timing-function: linear;
  /* Scroll-driven: duration must stay auto, the shorthand would set 0s. */
  animation-duration: auto;
  animation-timeline: scroll(root);
  animation-range: 0 ${HERO_EXIT_SCROLL_PX}px;
  height: calc(100% + 80px);
  inset: -40px;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  position: absolute;
  transition: opacity ${DURATION.xl} ease;
  width: calc(100% + 80px);

  @keyframes program-hero-drift {
    37.5% {
      filter: brightness(0.85);
      transform: translate3d(0, 238px, 0);
    }

    56% {
      filter: brightness(0.64);
      transform: translate3d(0, 338px, 0);
    }

    75% {
      filter: brightness(0.4);
      transform: translate3d(0, 427px, 0);
    }

    to {
      filter: brightness(0.12);
      transform: translate3d(0, 525px, 0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

type ProgramHeroBackdropProps = {
  imageUrl: string;
  isFaint?: boolean;
  // Off when the page needs its WebGL slots for visuals further down.
  isPriority?: boolean;
};

export function ProgramHeroBackdrop({
  imageUrl,
  isFaint = false,
  isPriority = false,
}: ProgramHeroBackdropProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);

  // The rig holds its WebGL context seconds after leaving; the visuals below need it now.
  useEffect(() => {
    const root = rootRef.current;
    if (!isDefined(root)) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIsOnScreen(entry.isIntersecting);
      if (!entry.isIntersecting) {
        setIsReady(false);
      }
    });
    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Root
      aria-hidden
      data-faint={isFaint ? '' : undefined}
      data-illustration="program-hero-photo"
      ref={rootRef}
    >
      <BackdropMount $isReady={isReady}>
        {isOnScreen && (
          <HalftoneImageBackdrop
            imageUrl={imageUrl}
            loading={isPriority ? 'eager' : undefined}
            onFirstFrame={() => setIsReady(true)}
            priority={isPriority}
            settings={PROGRAM_HERO_BACKDROP_SETTINGS}
          />
        )}
      </BackdropMount>
    </Root>
  );
}
