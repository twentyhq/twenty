import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { clsx } from 'clsx';

import { isRenderableSlot } from '@ui/primitives/navigation/ListItem/internal/isRenderableSlot';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './SegmentedControl.module.scss';
import { type SegmentedControlProps } from './types/SegmentedControlProps';

export const SegmentedControl = <TValue extends string>({
  className,
  itemWidth = 'equal',
  options,
  ...props
}: SegmentedControlProps<TValue>) => (
  <RadioGroupPrimitive
    {...props}
    className={mergeClassNames(styles.container, className)}
    data-item-width={itemWidth}
  >
    {options.map(
      ({ 'aria-label': ariaLabel, disabled, label, startIcon, value }) => (
        <RadioPrimitive.Root
          key={value}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          className={clsx(
            styles.item,
            !isRenderableSlot(label) && styles.iconOnly,
          )}
        >
          {isRenderableSlot(startIcon) && (
            <span className={styles.icon} aria-hidden>
              {startIcon}
            </span>
          )}
          {isRenderableSlot(label) && (
            <span className={styles.label}>{label}</span>
          )}
        </RadioPrimitive.Root>
      ),
    )}
  </RadioGroupPrimitive>
);
