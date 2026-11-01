import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Avatar.module.scss';
import { type AvatarFallbackProps } from '../types/AvatarFallbackProps';

export const AvatarFallback = ({
  className,
  ...props
}: AvatarFallbackProps) => (
  <AvatarPrimitive.Fallback
    {...props}
    className={mergeClassNames(styles.fallback, className)}
  />
);
