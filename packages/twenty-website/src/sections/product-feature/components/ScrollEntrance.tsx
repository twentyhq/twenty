'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { getReducedMotionSnapshot } from '@/platform/motion';
import { observeElementVisibility } from '@/platform/visuals/engine/observe-element-visibility';
import { REDUCED_MOTION } from '@/tokens';

const VIEWPORT_THRESHOLD = 0.1;

const Entrance = styled.div`
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
  width: 100%;

  &[data-visible] {
    opacity: 1;
  }

  ${REDUCED_MOTION} {
    opacity: 1 !important;
    transition: none !important;
  }
`;

export function ScrollEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    if (getReducedMotionSnapshot()) {
      setIsVisible(true);
      return undefined;
    }

    return observeElementVisibility(element, setIsVisible, {
      threshold: VIEWPORT_THRESHOLD,
    });
  }, []);

  return (
    <Entrance data-visible={isVisible ? '' : undefined} ref={ref}>
      {children}
    </Entrance>
  );
}
