import { type ReactNode } from 'react';

import { type AvatarShape } from '@ui/primitives/data-display/Avatar/types/AvatarShape';

export type AvatarGroupProps = {
  avatars: ReactNode[];
  className?: string;
  maxVisible?: number;
  overflowAvatar?: ReactNode;
  overflowCount?: number;
  overflowShape?: AvatarShape;
  overlap?: 'left' | 'right';
  overlapOffset?: string;
};
