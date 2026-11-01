import { type ReactNode } from 'react';

import { type AvatarFallbackProps } from './AvatarFallbackProps';
import { type AvatarImageProps } from './AvatarImageProps';
import { type AvatarRootProps } from './AvatarRootProps';

export type AvatarProps = Omit<AvatarRootProps, 'children' | 'onClick'> & {
  src?: string | null;
  icon?: ReactNode;
  imageProps?: AvatarImageProps;
  fallbackProps?: AvatarFallbackProps;
};
