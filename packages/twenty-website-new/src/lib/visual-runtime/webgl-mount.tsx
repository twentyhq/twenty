'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { observeElementVisibility } from '@/lib/dom/observe-element-visibility';

import {
  subscribeToActiveWebGlContextCount,
  tryReserveWebGlContextSlot,
} from './active-webgl-context-budget';
import { useWebGlPolicy } from './use-webgl-policy';
import { WebGlErrorBoundary } from './webgl-error-boundary';

const NON_PRIORITY_ROOT_MARGIN = '50% 0px 50% 0px';

const OUT_OF_VIEW_DISPOSE_MS = 4_000;

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

type WebGlMountProps = {
  children: ReactNode;
  fallback?: ReactNode;
  detachFromLayout?: boolean;
  priority?: boolean;
};

export function WebGlMount({
  children,
  fallback,
  detachFromLayout = false,
  priority = false,
}: WebGlMountProps) {
  const policy = useWebGlPolicy();
  const rootReference = useRef<HTMLDivElement>(null);

  const [isInViewport, setIsInViewport] = useState(priority);

  const [hasContextSlot, setHasContextSlot] = useState(false);

  useEffect(() => {
    if (priority) {
      return;
    }

    const element = rootReference.current;
    if (!element) {
      return;
    }

    let disposeTimer: ReturnType<typeof setTimeout> | null = null;
    const clearDisposeTimer = () => {
      if (disposeTimer !== null) {
        clearTimeout(disposeTimer);
        disposeTimer = null;
      }
    };

    const stopObservingVisibility = observeElementVisibility(
      element,
      (isIntersecting) => {
        if (isIntersecting) {
          clearDisposeTimer();
          setIsInViewport(true);
          return;
        }

        clearDisposeTimer();
        disposeTimer = setTimeout(() => {
          setIsInViewport(false);
          disposeTimer = null;
        }, OUT_OF_VIEW_DISPOSE_MS);
      },
      { root: null, rootMargin: NON_PRIORITY_ROOT_MARGIN, threshold: 0 },
    );

    return () => {
      clearDisposeTimer();
      stopObservingVisibility();
    };
  }, [priority]);

  const wantsScene = policy.allowed && isInViewport;

  useEffect(() => {
    if (!wantsScene) {
      return;
    }

    let release: (() => void) | null = null;
    let unsubscribe: (() => void) | null = null;

    const tryAcquire = () => {
      if (release !== null) {
        return;
      }
      const reservation = tryReserveWebGlContextSlot();
      if (reservation === null) {
        return;
      }
      release = reservation;
      if (unsubscribe !== null) {
        unsubscribe();
        unsubscribe = null;
      }
      setHasContextSlot(true);
    };

    tryAcquire();

    if (release === null) {
      unsubscribe = subscribeToActiveWebGlContextCount(tryAcquire);
    }

    return () => {
      if (unsubscribe !== null) {
        unsubscribe();
        unsubscribe = null;
      }
      if (release !== null) {
        release();
        release = null;
      }
      setHasContextSlot(false);
    };
  }, [wantsScene]);

  const renderInner = wantsScene && hasContextSlot;

  return (
    <ObserverRoot ref={rootReference} detachFromLayout={detachFromLayout}>
      {renderInner ? (
        <WebGlErrorBoundary fallback={fallback}>{children}</WebGlErrorBoundary>
      ) : (
        (fallback ?? null)
      )}
    </ObserverRoot>
  );
}
