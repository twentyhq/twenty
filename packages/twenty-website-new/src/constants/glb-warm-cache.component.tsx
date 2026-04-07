'use client';

import { getAllWebsiteGlbUrls } from '@/constants/website-glb-urls';
import { useEffect } from 'react';

// Warms the browser cache for every marketing GLB right after hydration so LazyEmbed + useGLTF hit disk cache.
export const GlbWarmCache = () => {
  useEffect(() => {
    const urls = getAllWebsiteGlbUrls();

    for (const url of urls) {
      void fetch(url, {
        priority: 'low',
      } as RequestInit & { priority?: RequestPriority });
    }
  }, []);

  return null;
};
