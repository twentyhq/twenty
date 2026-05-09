'use client';

import dynamic from 'next/dynamic';

const FaqBackgroundWebGl = dynamic(
  () =>
    import('./FaqBackgroundMount').then((mod) => ({
      default: mod.FaqBackgroundMount,
    })),
  { ssr: false },
);

export function LazyFaqBackground() {
  return <FaqBackgroundWebGl />;
}
