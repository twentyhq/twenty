import { type ReactNode } from 'react';

export type AvatarGroupProps = {
  avatars: ReactNode[];
  className?: string;
  maxVisible?: number;
  overflowAvatar?: ReactNode;
  overlap?: 'left' | 'right';
  overlapOffset?: string;
};
