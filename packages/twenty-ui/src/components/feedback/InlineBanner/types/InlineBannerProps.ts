import { type BannerProps } from '@ui/primitives/feedback/Banner/types/BannerProps';

import { type InlineBannerLayout } from './InlineBannerLayout';

export type InlineBannerProps = Omit<
  BannerProps,
  'onDismiss' | 'closeLabel'
> & {
  layout?: InlineBannerLayout;
  embedded?: boolean;
  fullWidth?: boolean;
};
