import { type Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { type AvatarShape } from './AvatarShape';
import { type AvatarSize } from './AvatarSize';

export type AvatarRootProps = AvatarPrimitive.Root.Props & {
  name?: string;
  colorSeed?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  variant?: 'soft' | 'outline';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  pulsing?: boolean;
  ring?: boolean;
};
