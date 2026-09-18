import { IconButton } from '@ui/components/IconButton/IconButton';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './FloatingIconButton.module.scss';
import { type FloatingIconButtonProps } from './types/FloatingIconButtonProps';

export const FloatingIconButton = ({
  className,
  size = 'sm',
  elevated = true,
  blur = true,
  ...props
}: FloatingIconButtonProps) => (
  <IconButton
    {...props}
    size={size}
    elevated={elevated}
    data-blur={blur || undefined}
    className={mergeClassNames(styles.button, className)}
  />
);
