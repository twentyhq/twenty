import { Button } from '@ui/primitives/input/Button/Button';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './LightButton.module.scss';
import { type LightButtonProps } from './types/LightButtonProps';

export const LightButton = ({
  className,
  emphasis = 'standard',
  size = 'sm',
  variant = 'ghost',
  ...props
}: LightButtonProps) => (
  <Button
    {...props}
    size={size}
    variant={variant}
    data-emphasis={emphasis}
    className={mergeClassNames(styles.button, className)}
  />
);
