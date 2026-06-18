'use client';

import { useEffect } from 'react';

import { BREAKPOINT_PX } from '@/tokens';

export type CloseDrawerOnDesktopEffectProps = {
  onClose: () => void;
};

// The drawer is a sub-md affordance: when the viewport grows past the
// breakpoint, the desktop nav appears and the drawer must not linger.
export function CloseDrawerOnDesktopEffect({
  onClose,
}: CloseDrawerOnDesktopEffectProps) {
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINT_PX.md}px)`);

    const handleChange = () => {
      if (mediaQuery.matches) onClose();
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onClose]);

  return null;
}
