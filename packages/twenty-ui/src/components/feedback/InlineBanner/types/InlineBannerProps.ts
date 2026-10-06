import { type BannerProps } from '@ui/primitives/feedback/Banner/types/BannerProps';

import { type InlineBannerLayout } from './InlineBannerLayout';

export type InlineBannerProps = BannerProps & {
  layout?: InlineBannerLayout;
  embedded?: boolean;
};
