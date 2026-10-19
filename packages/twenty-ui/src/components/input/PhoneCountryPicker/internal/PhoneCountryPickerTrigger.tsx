import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown, IconWorld } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../PhoneCountryPicker.module.scss';
import { type PhoneCountryPickerTriggerProps } from '../types/PhoneCountryPickerTriggerProps';
import { usePhoneCountryPickerContextOrThrow } from './usePhoneCountryPickerContextOrThrow';

export const PhoneCountryPickerTrigger = ({
  children,
  disabled: triggerDisabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: PhoneCountryPickerTriggerProps) => {
  const { countries, value, disabled } = usePhoneCountryPickerContextOrThrow();
  const country = countries.find((choice) => choice.value === value);
  const selectedCountryLabelId = useId();
  const describedBy =
    [isDefined(country) && selectedCountryLabelId, ariaDescribedBy]
      .filter(isNonEmptyString)
      .join(' ') || undefined;

  return (
    <Dropdown.Trigger
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      disabled={disabled || triggerDisabled}
      aria-describedby={describedBy}
      className={mergeClassNames(styles.trigger, className)}
    >
      {children ?? (
        <>
          <span className={styles.triggerFlag} aria-hidden>
            {country?.flag ?? <IconWorld />}
          </span>
          <IconChevronDown className={styles.chevron} aria-hidden />
        </>
      )}
      {isDefined(country) && (
        <span
          id={selectedCountryLabelId}
          className={styles.selectedCountryLabel}
        >
          {country.label}
        </span>
      )}
    </Dropdown.Trigger>
  );
};
