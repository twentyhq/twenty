import { NumberField } from '@base-ui/react/number-field';
import { useControlled } from '@base-ui/utils/useControlled';
import { clsx } from 'clsx';

import { IconMinus, IconPlus } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './NumberInput.module.scss';
import { type NumberInputProps } from './types/NumberInputProps';

const NUMBER_INPUT_MAXIMUM_FRACTION_DIGITS = 15;

export const NumberInput = ({
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
}: NumberInputProps) => {
  const [resolvedValue, setResolvedValue] = useControlled({
    controlled: value,
    default: defaultValue ?? null,
    name: 'NumberInput',
    state: 'value',
  });

  return (
    <NumberField.Root
      value={resolvedValue}
      onValueChange={(nextValue, eventDetails) => {
        if (nextValue === resolvedValue) {
          return;
        }

        onValueChange?.(nextValue, eventDetails);

        if (!eventDetails.isCanceled) {
          setResolvedValue(nextValue);
        }
      }}
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
      format={{
        useGrouping: false,
        maximumFractionDigits: NUMBER_INPUT_MAXIMUM_FRACTION_DIGITS,
      }}
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
          clsx(inputStyles.input, inputStyles.sm, styles.input),
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
