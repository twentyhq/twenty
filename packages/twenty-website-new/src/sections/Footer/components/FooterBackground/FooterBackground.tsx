'use client';

import dynamic from 'next/dynamic';
import type { ComponentPropsWithoutRef } from 'react';

const FooterBackgroundCanvas = dynamic(
  () =>
    import('./FooterBackgroundCanvas').then((mod) => ({
      default: mod.FooterBackgroundCanvas,
    })),
  { ssr: false },
);

type FooterBackgroundProps = ComponentPropsWithoutRef<'div'>;

export function FooterBackground(props: FooterBackgroundProps) {
  return <FooterBackgroundCanvas {...props} />;
}
