'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { observeElementVisibility } from './observe-element-visibility';
import { useWebGlGate } from './use-webgl-gate';
import { VisualErrorBoundary } from './visual-error-boundary';
import { VisualRuntimeContext } from './visual-runtime-context';
import { webGlContextBudget } from './webgl-context-budget';
import { WEBGL_CONTEXT_LOST_EVENT } from './webgl-context-lost-event';

// Mount margins are fractions of the viewport: scenes prepare well before
// they scroll in. Leaving the margin starts a grace timer so a quick
// scroll-back doesn't pay a full remount.
const LAZY_ROOT_MARGIN = '50% 0px 50% 0px';
const PRIORITY_ROOT_MARGIN = '125% 0px 125% 0px';
const EAGER_ROOT_MARGIN = '600% 0px 600% 0px';
const OUT_OF_VIEW_DISPOSE_MS = 4000;
const PRIORITY_OUT_OF_VIEW_DISPOSE_MS = 1500;

// display: contents would have no box, and a box is exactly what the
// viewport observer and the scene container need — fill the slot.
const MountRoot = styled.div`
  display: block;
  height: 100%;
  width: 100%;

  &[data-detached] {
    inset: 0;
    pointer-events: none;
    position: absolute;
  }
`;

export type VisualMountProps = {
  children: ReactNode;
  poster?: ReactNode;
  // 'poster' (default): reduced-motion visitors get the static poster and
  // never download the scene chunk. 'designed': the scene mounts and reads
  // useVisualRuntime().reducedMotion to render one frozen frame.
  reducedMotion?: 'poster' | 'designed';
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  detachFromLayout?: boolean;
};

export function VisualMount({
  children,
  poster = null,
  reducedMotion = 'poster',
  priority = false,
  loading = 'lazy',
  detachFromLayout = false,
}: VisualMountProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gate = useWebGlGate();
  const [isInViewport, setIsInViewport] = useState(false);
  const [hasSlot, setHasSlot] = useState(false);
  const [epoch, setEpoch] = useState(0);

  const showsPosterForMotion = gate.reducedMotion && reducedMotion === 'poster';
  const wantsScene = gate.allowed && !showsPosterForMotion && isInViewport;

  useEffect(() => {
    const root = rootRef.current;
    if (root === null || !gate.allowed || showsPosterForMotion) {
      return;
    }

    const rootMargin = priority
      ? PRIORITY_ROOT_MARGIN
      : loading === 'eager'
        ? EAGER_ROOT_MARGIN
        : LAZY_ROOT_MARGIN;
    const disposeDelayMs =
      priority || loading === 'eager'
        ? PRIORITY_OUT_OF_VIEW_DISPOSE_MS
        : OUT_OF_VIEW_DISPOSE_MS;

    let disposeTimer: ReturnType<typeof setTimeout> | null = null;

    const unobserve = observeElementVisibility(
      root,
      (isVisible) => {
        if (isVisible) {
          if (disposeTimer !== null) {
            clearTimeout(disposeTimer);
            disposeTimer = null;
          }
          setIsInViewport(true);
          return;
        }
        disposeTimer = setTimeout(() => {
          setIsInViewport(false);
        }, disposeDelayMs);
      },
      { rootMargin },
    );

    return () => {
      if (disposeTimer !== null) {
        clearTimeout(disposeTimer);
      }
      unobserve();
    };
  }, [gate.allowed, showsPosterForMotion, priority, loading]);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) {
      return;
    }
    const handleContextLost = () => {
      setEpoch((previous) => previous + 1);
    };
    root.addEventListener(WEBGL_CONTEXT_LOST_EVENT, handleContextLost);
    return () => {
      root.removeEventListener(WEBGL_CONTEXT_LOST_EVENT, handleContextLost);
    };
  }, []);

  // The whole acquisition path: one request, one idempotent settle. The
  // epoch dependency makes React serialize release -> re-request across a
  // context-lost remount; the budget's token discipline makes a stale
  // cleanup releasing the new epoch's slot unrepresentable.
  useEffect(() => {
    if (!wantsScene) {
      setHasSlot(false);
      return;
    }
    const settle = webGlContextBudget.request({
      priority: priority ? 'priority' : 'normal',
      onGranted: () => setHasSlot(true),
    });
    return () => {
      settle();
      setHasSlot(false);
    };
  }, [wantsScene, priority, epoch]);

  const rendersScene = wantsScene && hasSlot;
  const runtimeValue = useMemo(
    () => ({
      reducedMotion: gate.reducedMotion && reducedMotion === 'designed',
    }),
    [gate.reducedMotion, reducedMotion],
  );

  return (
    <MountRoot data-detached={detachFromLayout ? '' : undefined} ref={rootRef}>
      {rendersScene ? (
        <VisualErrorBoundary fallback={poster} key={epoch}>
          <VisualRuntimeContext.Provider value={runtimeValue}>
            {children}
          </VisualRuntimeContext.Provider>
        </VisualErrorBoundary>
      ) : (
        poster
      )}
    </MountRoot>
  );
}
