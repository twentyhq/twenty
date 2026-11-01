import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { clsx } from 'clsx';

import buttonStyles from '@ui/primitives/input/Button/Button.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../NumberField.module.scss';
import { type NumberFieldIncrementProps } from '../types/NumberFieldIncrementProps';

export const NumberFieldIncrement = ({
  className,
  ...props
}: NumberFieldIncrementProps) => (
  <NumberFieldPrimitive.Increment
    {...props}
    className={mergeClassNames(
      clsx(buttonStyles.button, styles.button),
      className,
    )}
  />
);
