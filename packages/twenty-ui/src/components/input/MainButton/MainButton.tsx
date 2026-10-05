import { Button } from '@ui/primitives/input/Button/Button';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './MainButton.module.scss';

export const MainButton = ({
  className,
  elevated = true,
  variant = 'solid',
  ...props
}: ButtonProps) => (
  <Button
    {...props}
    elevated={elevated}
    variant={variant}
    className={mergeClassNames(styles.button, className)}
  />
);
