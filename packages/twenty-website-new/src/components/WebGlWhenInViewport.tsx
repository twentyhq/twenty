'use client';

import { styled } from '@linaria/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

const VERTICAL_MARGIN_PX = 100;
const ROOT_MARGIN = `${VERTICAL_MARGIN_PX}px 0px ${VERTICAL_MARGIN_PX}px 0px`;
const OUT_OF_VIEW_DISPOSE_MS = 300;

const ObserverRoot = styled.div<{ detachFromLayout: boolean }>`
  height: 100%;
  min-height: 1px;
  pointer-events: none;
  width: 100%;

  & > * {
    pointer-events: auto;
  }

  ${({ detachFromLayout }) =>
    detachFromLayout
      ? `
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  `
      : `
    position: relative;
  `}
`;

function isLikelyInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

  return (
    rect.bottom > -VERTICAL_MARGIN_PX &&
    rect.top < viewportHeight + VERTICAL_MARGIN_PX &&
    rect.right > 0 &&
    rect.left < viewportWidth
  );
}

type WebGlWhenInViewportProps = {
  children: ReactNode;
  detachFromLayout?: boolean;
};

export function WebGlWhenInViewport({
  children,
  detachFromLayout = false,
}: WebGlWhenInViewportProps) {
  const rootReference = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const disposeTimerReference = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useLayoutEffect(() => {
    const element = rootReference.current;

    if (!element) {
      return;
    }

    const clearDisposeTimer = () => {
      if (disposeTimerReference.current !== null) {
        clearTimeout(disposeTimerReference.current);
        disposeTimerReference.current = null;
      }
    };

    if (isLikelyInViewport(element)) {
      setShouldRender(true);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearDisposeTimer();
          setShouldRender(true);
          return;
        }

        clearDisposeTimer();
        disposeTimerReference.current = setTimeout(() => {
          setShouldRender(false);
          disposeTimerReference.current = null;
        }, OUT_OF_VIEW_DISPOSE_MS);
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(element);

    return () => {
      clearDisposeTimer();
      observer.disconnect();
    };
  }, []);

  return (
    <ObserverRoot ref={rootReference} detachFromLayout={detachFromLayout}>
      {shouldRender ? children : null}
    </ObserverRoot>
  );
}
