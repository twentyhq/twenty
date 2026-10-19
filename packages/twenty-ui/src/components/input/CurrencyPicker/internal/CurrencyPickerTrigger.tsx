import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../CurrencyPicker.module.scss';
import { type CurrencyPickerTriggerProps } from '../types/CurrencyPickerTriggerProps';
import { useCurrencyPickerContextOrThrow } from './useCurrencyPickerContextOrThrow';

export const CurrencyPickerTrigger = ({
  children,
  placeholder,
  disabled = false,
  className,
  ...props
}: CurrencyPickerTriggerProps) => {
  const { state, renderValue } = useCurrencyPickerContextOrThrow();
  const valueLabel = isDefined(state.value) ? state.value : placeholder;

  return (
    <Dropdown.Trigger
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      disabled={state.disabled || disabled}
      className={mergeClassNames(styles.trigger, className)}
    >
      {children ?? (isDefined(renderValue) ? renderValue(state) : valueLabel)}
      <IconChevronDown aria-hidden="true" className={styles.chevron} />
    </Dropdown.Trigger>
  );
};
