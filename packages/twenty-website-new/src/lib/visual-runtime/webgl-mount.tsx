'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import {
  subscribeToActiveWebGlContextCount,
  tryReserveWebGlContextSlot,
} from './active-webgl-context-budget';
import { useWebGlPolicy } from './use-webgl-policy';
import { WebGlErrorBoundary } from './webgl-error-boundary';

/**
 * How far outside the viewport we start mounting non-priority scenes.
 * 50vh of head start gives the GLB fetch, DRACO warm-up, and Three.js
 * scene init enough time to finish before the user scrolls into view.
 */
const NON_PRIORITY_ROOT_MARGIN = '50% 0px 50% 0px';

/**
 * How long a scene that just left the viewport keeps its context slot.
 * Short enough that the page-wide budget recovers under sustained
 * scrolling (the marketing home page has ~10 visuals competing for 8
 * slots), long enough that small scroll oscillations don't trigger a
 * full Three.js teardown + GLB+DRACO refetch on the way back.
 */
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
  /**
   * Static, on-brand element rendered when the policy denies WebGL,
   * when the page-wide context budget is exhausted, or (for non-priority
   * mounts) before the viewport gate has been crossed. Should preserve
   * the visual footprint of the heavy visual so layout stays stable.
   */
  fallback?: ReactNode;
  detachFromLayout?: boolean;
  /**
   * Above-the-fold visuals: render as soon as the WebGL policy permits
   * and a budget slot is available, without waiting for an
   * IntersectionObserver tick. Also disables the out-of-view dispose
   * timer — these scenes are visible from first paint and there is no
   * benefit to ever tearing them down.
   *
   * Default `false`. Set to `true` for hero / first-screen visuals only.
   */
  priority?: boolean;
};

/**
 * The single mount surface for any heavy WebGL visual on the website.
 *
 * Lifecycle, in order:
 *   1. The visual runtime policy decides whether WebGL is usable on this
 *      device at all (kill switch + capability probe).
 *   2. For non-priority mounts, an IntersectionObserver waits until the
 *      element is within ~50vh of the viewport.
 *   3. *Atomically*, this component reserves one slot from the page-wide
 *      WebGL context budget. If no slot is free, the fallback renders
 *      and we keep listening for slot availability so the scene can
 *      hydrate the moment another visual scrolls away and frees one.
 *   4. The child Three.js scene mounts. It can `await` GLB fetches
 *      freely — the slot is already ours and won't be stolen.
 *   5. On unmount (scroll-out-of-view, route change, error), the slot
 *      is released synchronously in cleanup.
 *
 * Tab-visibility pausing is intentionally NOT done here — browsers
 * already throttle `requestAnimationFrame` on hidden tabs to ~1Hz, and
 * forcing a full Three.js teardown on every tab focus would cost orders
 * of magnitude more than the throttled rAF it tries to save.
 *
 * Layout footprint is always preserved — the wrapper stays in the DOM so
 * surrounding sections don't reflow when the inner canvas mounts/unmounts.
 */
export function WebGlMount({
  children,
  fallback,
  detachFromLayout = false,
  priority = false,
}: WebGlMountProps) {
  const policy = useWebGlPolicy();
  const rootReference = useRef<HTMLDivElement>(null);

  // Priority mounts skip the viewport gate entirely. Non-priority mounts
  // start hidden and are flipped on by the IntersectionObserver below.
  const [isInViewport, setIsInViewport] = useState(priority);

  // True iff this component currently holds one budget slot. The slot is
  // reserved atomically below; child scenes only render when this is
  // true, which guarantees no `createSiteWebGlRenderer` call ever races
  // against another mount for the last available slot.
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

    observer.observe(element);

    return () => {
      clearDisposeTimer();
      observer.disconnect();
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
      // Budget is full. Subscribe to the budget so we acquire the slot
      // the instant another mount releases one — no polling, no race.
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
