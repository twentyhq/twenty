import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { clsx } from 'clsx';

import styles from './IconButtonGroup.module.scss';
import { type IconButtonGroupProps } from './types/IconButtonGroupProps';

export const IconButtonGroup = ({
  className,
  variant = 'ghost',
  ...props
}: IconButtonGroupProps) => (
  <ButtonGroup
    {...props}
    variant={variant}
    attached={false}
    className={clsx(styles.container, className)}
  />
);
