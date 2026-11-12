import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { isFunction } from '@sniptt/guards';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './RadioGroup.module.scss';
import { type RadioGroupProps } from './types/RadioGroupProps';

const DEFAULT_MIN_COLUMN_WIDTH = 148;

export const RadioGroup = <TValue,>({
  className,
  orientation = 'vertical',
  layout = 'list',
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
  style,
  ...props
}: RadioGroupProps<TValue>) => (
  <RadioGroupPrimitive
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={mergeClassNames(styles.root, className)}
    data-orientation={orientation}
    data-layout={layout}
    style={(state) => ({
      '--tw-radio-group-min-column-width': `${minColumnWidth}px`,
      ...(isFunction(style) ? style(state) : style),
    })}
  />
);
