import { type Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { type ReactNode } from 'react';

import { type AvatarSize } from './AvatarSize';
import { type AvatarShape } from './AvatarShape';

export type AvatarProps = Omit<AvatarPrimitive.Root.Props, 'children'> & {
  src?: string | null;
  name?: string;
  colorSeed?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  variant?: 'soft' | 'outline';
  icon?: ReactNode;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  pulsing?: boolean;
  disabled?: boolean;
  nativeButton?: boolean;
};
