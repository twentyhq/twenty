'use client';

import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import dynamic from 'next/dynamic';
import type { ComponentPropsWithoutRef } from 'react';

const FooterBackgroundCanvas = dynamic(
  () =>
    import('./FooterBackgroundCanvas').then((mod) => ({
      default: mod.FooterBackgroundCanvas,
    })),
  { ssr: false },
);

type FooterBackgroundProps = ComponentPropsWithoutRef<'div'> & {
  illustration: IllustrationType;
};

export function FooterBackground({
  illustration,
  ...rest
}: FooterBackgroundProps) {
  return (
    <FooterBackgroundCanvas {...rest} illustration={illustration} />
  );
}
