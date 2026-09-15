import { type AvatarProps } from '@ui/primitives/data-display/Avatar/types/AvatarProps';
import { type AvatarShape } from '@ui/primitives/data-display/Avatar/types/AvatarShape';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { type Nullable } from '@ui/utilities';

export type AvatarOrIconProps = Pick<
  AvatarProps,
  'src' | 'name' | 'colorSeed'
> & {
  shape?: Nullable<AvatarShape>;
  Icon?: IconComponent;
  IconColor?: string;
  IconBackgroundColor?: string;
  isIconInverted?: boolean;
  onClick?: () => void;
};
