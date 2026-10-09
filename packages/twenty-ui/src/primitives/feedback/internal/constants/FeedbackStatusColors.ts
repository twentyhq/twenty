import { type BannerColor } from '@ui/primitives/feedback/Banner/types/BannerColor';
import { type BannerStatus } from '@ui/primitives/feedback/Banner/types/BannerStatus';

export const FEEDBACK_STATUS_COLORS = {
  neutral: 'gray',
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
} satisfies Record<BannerStatus, BannerColor>;
