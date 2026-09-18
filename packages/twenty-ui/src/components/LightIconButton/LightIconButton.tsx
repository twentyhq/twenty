import { IconButton } from '@ui/components/IconButton/IconButton';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './LightIconButton.module.scss';
import { type LightIconButtonProps } from './types/LightIconButtonProps';

export const LightIconButton = ({
  className,
  emphasis = 'standard',
  size = 'sm',
  variant = 'ghost',
  ...props
}: LightIconButtonProps) => (
  <IconButton
    {...props}
    size={size}
    variant={variant}
    data-emphasis={emphasis}
    className={mergeClassNames(styles.button, className)}
  />
);
