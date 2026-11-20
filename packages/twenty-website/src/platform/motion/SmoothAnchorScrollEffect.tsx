'use client';

import { useEffect } from 'react';

import { getReducedMotionSnapshot } from './reduced-motion-snapshot';

// Smooth scrolling for same-page anchor links only. The CSS scroll-behavior
// would also animate the browser's scroll restoration on back navigation.
export function SmoothAnchorScrollEffect() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const hash = event.target
        .closest('a[href^="#"]')
        ?.getAttribute('href')
        ?.slice(1);
      const target =
        hash === undefined || hash.length === 0
          ? null
          : document.getElementById(hash);

      if (target === null) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: getReducedMotionSnapshot() ? 'auto' : 'smooth',
        block: 'start',
      });
      window.history.pushState(null, '', `#${hash}`);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
