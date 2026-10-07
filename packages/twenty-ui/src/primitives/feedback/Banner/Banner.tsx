import { BannerAction } from './internal/BannerAction';
import { BannerComponent } from './internal/BannerComponent';

export const Banner = Object.assign(BannerComponent, {
  Action: BannerAction,
});
