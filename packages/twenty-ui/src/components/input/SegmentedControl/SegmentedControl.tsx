import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId } from 'react';

import { Radio } from '@ui/primitives/input/Radio/Radio';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './SegmentedControl.module.scss';
import { type SegmentedControlProps } from './types/SegmentedControlProps';

export const SegmentedControl = <TValue extends string>({
  className,
  fullWidth = false,
  itemWidth = 'equal',
  options,
  size = 'md',
  variant = 'round',
  ...props
}: SegmentedControlProps<TValue>) => {
  const optionNameIdPrefix = useId();

  return (
    <RadioGroupPrimitive
      {...props}
      className={mergeClassNames(
        clsx(styles.container, styles[size], fullWidth && styles.fullWidth),
        className,
      )}
      data-item-width={itemWidth}
      data-variant={variant}
    >
      {options.map(
        (
          { 'aria-label': ariaLabel, disabled, label, startIcon, value },
          index,
        ) => {
          const optionNameId = `${optionNameIdPrefix}-${index}`;
          const hasAriaLabel = isNonEmptyString(ariaLabel);

          return (
            <Radio.Root
              key={value}
              value={value}
              disabled={disabled}
              aria-labelledby={optionNameId}
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
                <span
                  id={hasAriaLabel ? undefined : optionNameId}
                  className={styles.label}
                >
                  {label}
                </span>
              )}
              {hasAriaLabel && (
                <span id={optionNameId} hidden>
                  {ariaLabel}
                </span>
              )}
            </Radio.Root>
          );
        },
      )}
    </RadioGroupPrimitive>
  );
};
