import { type IconComponent } from '@ui/icon/types/IconComponent';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

export type InlineBannerButtonProps = Pick<
  ButtonProps,
  | 'onClick'
  | 'href'
  | 'render'
  | 'target'
  | 'rel'
  | 'download'
  | 'disabled'
  | 'aria-label'
> & {
  title?: string;
  hidden?: boolean;
  Icon?: IconComponent;
};
