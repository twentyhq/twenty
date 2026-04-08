'use client';

import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import type { ComponentPropsWithoutRef } from 'react';
import { FooterVisual } from '../FooterVisual/FooterVisual';
import { FooterBackgroundCanvasRoot } from './FooterBackgroundCanvasRoot';

type FooterBackgroundCanvasProps = {
  illustration: IllustrationType;
} & Pick<ComponentPropsWithoutRef<'div'>, 'aria-hidden'>;

export function FooterBackgroundCanvas({
  illustration,
  'aria-hidden': ariaHidden,
}: FooterBackgroundCanvasProps) {
  return (
    <FooterBackgroundCanvasRoot aria-hidden={ariaHidden}>
      <FooterVisual src={illustration.src} title={illustration.title} />
    </FooterBackgroundCanvasRoot>
  );
}
