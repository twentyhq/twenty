'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import { useScheduledOnScroll } from '@/platform/motion';
import { MENU_HEIGHT_PX, type Scheme } from '@/tokens';

import { findActiveSurfaceScheme } from './find-active-surface-scheme';

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
    const surfaces = surfacesRef.current.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        scheme: readScheme(element),
      };
    });
    const next = findActiveSurfaceScheme(surfaces, MENU_HEIGHT_PX);
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
