import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './RadioGroup.module.scss';
import { type RadioGroupProps } from './types/RadioGroupProps';

export const RadioGroup = <TValue,>({
  className,
  orientation = 'vertical',
  ...props
}: RadioGroupProps<TValue>) => (
  <RadioGroupPrimitive
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={mergeClassNames(styles.root, className)}
    data-orientation={orientation}
  />
);
