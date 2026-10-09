import { clsx } from 'clsx';

import { Radio } from '@ui/primitives/input/Radio/Radio';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

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
    data-item-width={itemWidth}
  >
    {options.map(
      ({ 'aria-label': ariaLabel, disabled, label, startIcon, value }) => (
        <Radio.Root
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
        </Radio.Root>
      ),
    )}
  </RadioGroup>
);
