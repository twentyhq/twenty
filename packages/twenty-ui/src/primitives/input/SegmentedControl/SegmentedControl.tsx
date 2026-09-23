import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { clsx } from 'clsx';

import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './SegmentedControl.module.scss';
import { type SegmentedControlProps } from './types/SegmentedControlProps';

export const SegmentedControl = <TValue extends string>({
  className,
  itemWidth = 'equal',
  options,
  ...props
}: SegmentedControlProps<TValue>) => (
  <RadioGroup
    {...props}
    className={mergeClassNames(styles.container, className)}
  >
    {options.map(({ label, startIcon, value, ...optionProps }) => (
      <RadioPrimitive.Root
        {...optionProps}
        key={value}
        value={value}
        nativeButton
        render={<button type="button" />}
        className={clsx(styles.item, !isDefined(label) && styles.iconOnly)}
        data-item-width={itemWidth}
      >
        <>
          {isDefined(startIcon) && (
            <span className={styles.icon} aria-hidden>
              {startIcon}
            </span>
          )}
          {isDefined(label) && <span className={styles.label}>{label}</span>}
        </>
      </RadioPrimitive.Root>
    ))}
  </RadioGroup>
);
