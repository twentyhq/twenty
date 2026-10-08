import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './RadioGroup.module.scss';
import { type RadioGroupProps } from './types/RadioGroupProps';

export const RadioGroup = <TValue,>({
  className,
  ...props
}: RadioGroupProps<TValue>) => (
  <RadioGroupPrimitive
    {...props}
    className={mergeClassNames(styles.root, className)}
  />
);
