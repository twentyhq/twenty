import { IconCheck, IconMinus } from '@ui/icon';

import styles from './Checkbox.module.scss';
import { CheckboxIndicator } from './internal/CheckboxIndicator';
import { CheckboxRoot } from './internal/CheckboxRoot';
import { type CheckboxProps } from './types/CheckboxProps';

export const Checkbox = Object.assign(
  ({ children, ...props }: CheckboxProps) => (
    <CheckboxRoot {...props}>
      <CheckboxIndicator>
        <IconCheck className={styles.check} aria-hidden />
        <IconMinus className={styles.minus} aria-hidden />
      </CheckboxIndicator>
      {children}
    </CheckboxRoot>
  ),
  { Root: CheckboxRoot, Indicator: CheckboxIndicator },
);
