import { Eyebrow as BaseEyebrow } from '@/design-system/components';
import type { ReactNode } from 'react';

type EditorialEyebrowProps = {
  children: ReactNode;
  colorScheme?: 'primary' | 'secondary';
};

export function Eyebrow({ children, colorScheme }: EditorialEyebrowProps) {
  return <BaseEyebrow colorScheme={colorScheme}>{children}</BaseEyebrow>;
}
