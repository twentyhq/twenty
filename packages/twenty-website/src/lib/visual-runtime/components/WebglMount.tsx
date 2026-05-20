'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { observeElementVisibility } from '@/lib/dom/observe-element-visibility';

import {
  subscribeToActiveWebGlContextCount,
  tryReserveWebGlContextSlot,
} from '../utils/active-webgl-context-budget';
import { SITE_WEBGL_CONTEXT_LOST_EVENT } from '../utils/create-site-webgl-renderer';
import {
  scheduleVisualMount,
  type VisualMountPriority,
} from '../utils/visual-mount-scheduler';
import { useWebGlPolicy } from '../hooks/use-webgl-policy';
import { WebGlErrorBoundary } from './WebglErrorBoundary';

const NON_PRIORITY_ROOT_MARGIN = '50% 0px 50% 0px';
const PRIORITY_ROOT_MARGIN = '125% 0px 125% 0px';
const EAGER_ROOT_MARGIN = '600% 0px 600% 0px';

const OUT_OF_VIEW_DISPOSE_MS = 4_000;
const PRIORITY_OUT_OF_VIEW_DISPOSE_MS = 1_500;

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

type WebGlMountLoading = 'lazy' | 'eager';

type WebGlMountProps = {
  children: ReactNode;
  fallback?: ReactNode;
  detachFromLayout?: boolean;
  loading?: WebGlMountLoading;
  priority?: boolean;
};

export function WebGlMount({
  children,
  fallback,
  detachFromLayout = false,
  loading = 'lazy',
  priority = false,
}: WebGlMountProps) {
  const policy = useWebGlPolicy();
  const rootReference = useRef<HTMLDivElement>(null);

  const [isInViewport, setIsInViewport] = useState(priority);

  const [isMountReady, setIsMountReady] = useState(false);

  const [hasContextSlot, setHasContextSlot] = useState(false);

  const [contextEpoch, setContextEpoch] = useState(0);

  useEffect(() => {
    const element = rootReference.current;
    if (!element) {
      return;
    }

    const isEager = loading === 'eager';
    const effectiveDisposeDelayMs =
      priority || isEager
        ? PRIORITY_OUT_OF_VIEW_DISPOSE_MS
        : OUT_OF_VIEW_DISPOSE_MS;
    const effectiveRootMargin = isEager
      ? EAGER_ROOT_MARGIN
      : priority
        ? PRIORITY_ROOT_MARGIN
        : NON_PRIORITY_ROOT_MARGIN;
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
        }, effectiveDisposeDelayMs);
      },
      {
        root: null,
        rootMargin: effectiveRootMargin,
        threshold: 0,
      },
    );

    return () => {
      clearDisposeTimer();
      stopObservingVisibility();
    };
  }, [loading, priority]);

  useEffect(() => {
    const element = rootReference.current;
    if (!element) {
      return;
    }

    const handleContextLost = () => {
      setHasContextSlot(false);
      setIsMountReady(false);
      setContextEpoch((epoch) => epoch + 1);
    };

    element.addEventListener(SITE_WEBGL_CONTEXT_LOST_EVENT, handleContextLost);

    return () => {
      element.removeEventListener(
        SITE_WEBGL_CONTEXT_LOST_EVENT,
        handleContextLost,
      );
    };
  }, []);

  const wantsScene = policy.allowed && isInViewport;
  const wantsContextSlot = wantsScene && isMountReady;
  const effectiveMountPriority: VisualMountPriority =
    priority || loading === 'eager' ? 'priority' : 'normal';

  useEffect(() => {
    setIsMountReady(false);

    if (!wantsScene) {
      return;
    }

    return scheduleVisualMount(() => setIsMountReady(true), {
      priority: effectiveMountPriority,
    });
  }, [contextEpoch, effectiveMountPriority, wantsScene]);

  useEffect(() => {
    if (!wantsContextSlot) {
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
  }, [wantsContextSlot]);

  const renderInner = wantsContextSlot && hasContextSlot;

  return (
    <ObserverRoot ref={rootReference} detachFromLayout={detachFromLayout}>
      {renderInner ? (
        <WebGlErrorBoundary key={contextEpoch} fallback={fallback}>
          {children}
        </WebGlErrorBoundary>
      ) : (
        (fallback ?? null)
      )}
    </ObserverRoot>
  );
}
