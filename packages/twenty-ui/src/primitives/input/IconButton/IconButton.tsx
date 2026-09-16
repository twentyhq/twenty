import { Button } from '@ui/primitives/input/Button/Button';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './IconButton.module.scss';
import { type IconButtonProps } from './types/IconButtonProps';

export const IconButton = ({
  children,
  className,
  ...props
}: IconButtonProps) => (
  <Button
    {...props}
    startIcon={<span className={styles.icon}>{children}</span>}
    className={mergeClassNames(styles.button, className)}
  />
);
