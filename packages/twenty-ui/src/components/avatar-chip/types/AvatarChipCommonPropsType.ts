import { Nullable } from '@ui/utilities';
import { AvatarType, IconComponent } from '@ui/display';

export type AvatarChipCommonProps = {
  placeholder?: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  Icon?: IconComponent;
  IconColor?: string;
  placeholderColorSeed?: string;
};
