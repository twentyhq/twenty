import { Radio } from '@ui/input/Radio/Radio';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './CardPicker.module.scss';
import { type CardPickerProps } from './types/CardPickerProps';

export const CardPicker = <TValue,>({
  children,
  className,
  ...props
}: CardPickerProps<TValue>) => (
  <Radio
    render={<div />}
    {...props}
    className={mergeClassNames(styles.container, className)}
  >
    <div className={styles.cardInner}>{children}</div>
  </Radio>
);
