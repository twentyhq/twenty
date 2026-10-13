import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';

import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type NumberFieldInputProps } from '../types/NumberFieldInputProps';

export const NumberFieldInput = ({
  className,
  ...props
}: NumberFieldInputProps) => (
  <NumberFieldPrimitive.Input
    {...props}
    className={mergeClassNames(inputStyles.input, className)}
  />
);
