'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import { useScheduledOnScroll } from '@/platform/motion';
import { type Scheme } from '@/tokens';

const MENU_HEIGHT_PX = 64;

function readScheme(element: Element): Scheme | null {
  const value = element.getAttribute('data-scheme');
  return value === 'light' || value === 'muted' || value === 'dark'
    ? value
    : null;
}

export function useActiveSurfaceScheme(): Scheme | null {
  const [activeScheme, setActiveScheme] = useState<Scheme | null>(null);
  const surfacesRef = useRef<Element[]>([]);
  const pathname = useUnlocalizedPathname();

  const sync = useCallback(() => {
    const surface = surfacesRef.current.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top <= MENU_HEIGHT_PX && rect.bottom > MENU_HEIGHT_PX;
    });
    const next = surface ? readScheme(surface) : null;
    setActiveScheme((previous) => (previous === next ? previous : next));
  }, []);

  useEffect(() => {
    surfacesRef.current = Array.from(
      document.querySelectorAll('[data-menu-surface]'),
    );
    sync();
  }, [pathname, sync]);

  useScheduledOnScroll(sync);

  return activeScheme;
}
