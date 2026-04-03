'use client';

import {
  type ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DEFAULT_LOAD_ROOT_MARGIN = '1200px 0px';
const DEFAULT_UNLOAD_ROOT_MARGIN = '1800px 0px';
const DEFAULT_UNLOAD_DELAY_MS = 1500;

type LazyEmbedProps = Omit<ComponentPropsWithoutRef<'iframe'>, 'loading' | 'src'> & {
  eager?: boolean;
  rootMargin?: string;
  src: string;
  unloadDelayMs?: number;
  unloadWhenHidden?: boolean;
  unloadRootMargin?: string;
};

export function LazyEmbed({
  eager = false,
  rootMargin = DEFAULT_LOAD_ROOT_MARGIN,
  unloadDelayMs = DEFAULT_UNLOAD_DELAY_MS,
  unloadWhenHidden = true,
  unloadRootMargin = DEFAULT_UNLOAD_ROOT_MARGIN,
  src,
  className,
  style,
  role,
  tabIndex,
  'aria-hidden': ariaHidden,
  ...iframeProps
}: LazyEmbedProps) {
  const [hostNode, setHostNode] = useState<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(eager);
  const unloadTimeoutRef = useRef<number | null>(null);

  const wrapperProps = useMemo(
    () => ({
      'aria-hidden': ariaHidden,
      className,
      role,
      style,
      tabIndex,
    }),
    [ariaHidden, className, role, style, tabIndex],
  );

  useEffect(() => {
    if (!hostNode) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const clearPendingUnload = () => {
      if (unloadTimeoutRef.current === null) {
        return;
      }

      window.clearTimeout(unloadTimeoutRef.current);
      unloadTimeoutRef.current = null;
    };

    const scheduleUnload = () => {
      if (!unloadWhenHidden || unloadTimeoutRef.current !== null) {
        return;
      }

      unloadTimeoutRef.current = window.setTimeout(() => {
        setShouldRender(false);
        unloadTimeoutRef.current = null;
      }, unloadDelayMs);
    };

    if (eager) {
      setShouldRender(true);
    }

    const loadObserver = new IntersectionObserver(
      (entries) => {
        const isNearViewport = entries.some((entry) => entry.isIntersecting);

        if (isNearViewport) {
          clearPendingUnload();
          setShouldRender(true);
        }
      },
      { rootMargin },
    );

    loadObserver.observe(hostNode);

    let unloadObserver: IntersectionObserver | null = null;

    if (unloadWhenHidden) {
      unloadObserver = new IntersectionObserver(
        (entries) => {
          const isStillClose = entries.some((entry) => entry.isIntersecting);

          if (isStillClose) {
            clearPendingUnload();
            return;
          }

          scheduleUnload();
        },
        { rootMargin: unloadRootMargin },
      );

      unloadObserver.observe(hostNode);
    }

    return () => {
      clearPendingUnload();
      loadObserver.disconnect();
      unloadObserver?.disconnect();
    };
  }, [
    eager,
    hostNode,
    rootMargin,
    unloadDelayMs,
    unloadWhenHidden,
    unloadRootMargin,
  ]);

  return (
    <div
      {...wrapperProps}
      ref={setHostNode}
    >
      {shouldRender ? (
        <iframe
          {...iframeProps}
          aria-hidden={ariaHidden}
          loading={eager ? 'eager' : 'lazy'}
          src={src}
          style={{
            border: 'none',
            display: 'block',
            height: '100%',
            width: '100%',
          }}
          tabIndex={tabIndex}
        />
      ) : null}
    </div>
  );
}
