import { type IconComponent } from '@ui/icon/types/IconComponent';
import { type BannerColor } from '@ui/primitives/feedback/Banner/Banner';
import { type InlineBannerButtonProps } from './InlineBannerButtonProps';

export type InlineBannerProps = {
  color?: BannerColor;
  message: string;
  variant?: 'standard' | 'compact';
  embedded?: boolean;
  button?: InlineBannerButtonProps;
  LeftIcon?: IconComponent;
  className?: string;
};
