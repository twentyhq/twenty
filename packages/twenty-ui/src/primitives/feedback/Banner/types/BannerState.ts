import { type BannerColor } from './BannerColor';
import { type BannerStatus } from './BannerStatus';
import { type BannerVariant } from './BannerVariant';

export type BannerState = {
  status: BannerStatus;
  variant: BannerVariant;
  color: BannerColor;
};
