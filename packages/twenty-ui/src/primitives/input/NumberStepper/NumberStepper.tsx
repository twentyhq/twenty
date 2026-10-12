import { NumberField } from '@base-ui/react/number-field';
import { useControlled } from '@base-ui/utils/useControlled';
import { useValueAsRef } from '@base-ui/utils/useValueAsRef';
import { clsx } from 'clsx';

import { IconMinus, IconPlus } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { NUMBER_STEPPER_FORMAT } from './internal/constants/NumberStepperFormat';
import { isBlurRoundingOfCurrentValue } from './internal/utils/isBlurRoundingOfCurrentValue';
import styles from './NumberStepper.module.scss';
import { type NumberStepperProps } from './types/NumberStepperProps';

export const NumberStepper = ({
  value,
  defaultValue,
  onValueChange,
  allowOutOfRange = false,
  min,
  max,
  step = 1,
  disabled,
  readOnly,
  required,
  name,
  form,
  id,
  showButtons = true,
  decrementLabel = 'Decrease value',
  incrementLabel = 'Increase value',
  className,
  ...props
}: NumberStepperProps) => {
  const [resolvedValue, setResolvedValue] = useControlled({
    controlled: value,
    default: defaultValue ?? null,
    name: 'NumberStepper',
    state: 'value',
  });
  const currentValueRef = useValueAsRef(resolvedValue);

  const handleValueChange: NonNullable<
    NumberField.Root.Props['onValueChange']
  > = (nextValue, eventDetails) => {
    if (nextValue === currentValueRef.current) {
      return;
    }

    const isRoundingOnlyBlurChange = isBlurRoundingOfCurrentValue({
      nextValue,
      currentValue: currentValueRef.current,
      reason: eventDetails.reason,
    });

    if (isRoundingOnlyBlurChange) {
      eventDetails.cancel();
      return;
    }

    onValueChange?.(nextValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    currentValueRef.current = nextValue;
    setResolvedValue(nextValue);
  };

  return (
    <NumberField.Root
      value={resolvedValue}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      allowOutOfRange={allowOutOfRange}
      step={step}
      smallStep={step}
      largeStep={step}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      form={form}
      id={id}
      format={NUMBER_STEPPER_FORMAT}
      className={styles.root}
    >
      {showButtons && (
        <NumberField.Decrement
          aria-label={decrementLabel}
          render={
            <Button
              type="button"
              size="sm"
              className={styles.button}
              startIcon={
                <span className={styles.icon}>
                  <IconMinus />
                </span>
              }
            />
          }
        />
      )}
      <NumberField.Input
        {...props}
        form={form}
        className={mergeClassNames(
          clsx(inputStyles.input, inputStyles.sm, styles.valueInput),
          className,
        )}
      />
      {showButtons && (
        <NumberField.Increment
          aria-label={incrementLabel}
          render={
            <Button
              type="button"
              size="sm"
              className={styles.button}
              startIcon={
                <span className={styles.icon}>
                  <IconPlus />
                </span>
              }
            />
          }
        />
      )}
    </NumberField.Root>
  );
};
