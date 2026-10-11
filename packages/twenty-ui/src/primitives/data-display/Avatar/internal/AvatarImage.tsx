import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Avatar.module.scss';
import { type AvatarImageProps } from '../types/AvatarImageProps';

export const AvatarImage = ({ className, ...props }: AvatarImageProps) => (
  <AvatarPrimitive.Image
    {...props}
    className={mergeClassNames(styles.image, className)}
  />
);
