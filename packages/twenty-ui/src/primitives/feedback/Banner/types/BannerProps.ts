import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type BannerColor } from './BannerColor';
import { type BannerState } from './BannerState';
import { type BannerStatus } from './BannerStatus';
import { type BannerVariant } from './BannerVariant';

export type BannerProps = Omit<
  useRender.ComponentProps<'div', BannerState>,
  'color'
> & {
  status?: BannerStatus;
  variant?: BannerVariant;
  color?: BannerColor;
  icon?: ReactNode;
  action?: ReactNode;
};
