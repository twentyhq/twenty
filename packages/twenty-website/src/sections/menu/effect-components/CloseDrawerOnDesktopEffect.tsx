'use client';

import { useEffect } from 'react';

import { BREAKPOINT_PX } from '@/tokens';

export type CloseDrawerOnDesktopEffectProps = {
  onClose: () => void;
};

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
