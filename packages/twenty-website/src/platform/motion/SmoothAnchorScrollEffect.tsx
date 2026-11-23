'use client';

import { useEffect } from 'react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { getReducedMotionSnapshot } from './reduced-motion-snapshot';

// CSS scroll-behavior would also animate scroll restoration on back navigation.
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
      const target = !isNonEmptyString(hash)
        ? null
        : document.getElementById(hash);

      if (!isDefined(target)) {
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
