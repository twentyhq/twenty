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

type FooterBackgroundProps = {
  illustration: IllustrationType;
} & Pick<ComponentPropsWithoutRef<'div'>, 'aria-hidden'>;

export function FooterBackground({
  illustration,
  'aria-hidden': ariaHidden,
}: FooterBackgroundProps) {
  return (
    <FooterBackgroundCanvas
      aria-hidden={ariaHidden}
      illustration={illustration}
    />
  );
}
