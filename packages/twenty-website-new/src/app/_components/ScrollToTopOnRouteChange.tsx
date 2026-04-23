'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/*
 * App Router is supposed to scroll to (0, 0) on every client-side
 * navigation, but the marketing footer routes through
 * `base-ui`'s <NavigationMenu.Link render={<NextLink />}>, which composes
 * its own click/focus handlers around the Link. In practice this defeats
 * Next's automatic scroll on a handful of routes — most visibly /releases,
 * where landing mid-page lands the user inside the release-notes list
 * instead of at the hero.
 *
 * We sidestep the prop-merge fight entirely: at the layout level, every
 * pathname change resets window scroll to the top, unless the URL carries
 * a hash (in which case the browser's native anchor behaviour wins). The
 * effect is a no-op on the initial paint — `useRef` skips the first run
 * so SSR + hydration don't fight the browser's restored scroll position
 * on a real refresh.
 */
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    if (window.location.hash !== '') {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
