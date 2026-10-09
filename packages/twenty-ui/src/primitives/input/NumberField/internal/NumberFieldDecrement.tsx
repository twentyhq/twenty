import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { clsx } from 'clsx';

import buttonStyles from '@ui/primitives/input/Button/Button.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../NumberField.module.scss';
import { type NumberFieldDecrementProps } from '../types/NumberFieldDecrementProps';

export const NumberFieldDecrement = ({
  className,
  ...props
}: NumberFieldDecrementProps) => (
  <NumberFieldPrimitive.Decrement
    {...props}
    className={mergeClassNames(
      clsx(buttonStyles.button, styles.button),
      className,
    )}
  />
);
