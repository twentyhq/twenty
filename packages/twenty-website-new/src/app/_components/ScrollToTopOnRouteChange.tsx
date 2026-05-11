'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const isInitialRenderRef = useRef(true);

  useLayoutEffect(() => {
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
