import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown, IconWorld } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../PhoneCountryPicker.module.scss';
import { type PhoneCountryPickerTriggerProps } from '../types/PhoneCountryPickerTriggerProps';

export const PhoneCountryPickerTrigger = ({
  country,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: PhoneCountryPickerTriggerProps) => {
  const selectedCountryLabelId = useId();
  const describedBy =
    [isDefined(country) && selectedCountryLabelId, ariaDescribedBy]
      .filter(isNonEmptyString)
      .join(' ') || undefined;

  return (
    <Dropdown.Trigger
      {...props}
      aria-describedby={describedBy}
      className={mergeClassNames(styles.trigger, className)}
    >
      <span className={styles.triggerFlag} aria-hidden>
        {country?.flag ?? <IconWorld />}
      </span>
      {isDefined(country) && (
        <span
          id={selectedCountryLabelId}
          className={styles.selectedCountryLabel}
        >
          {country.label}
        </span>
      )}
      <IconChevronDown className={styles.chevron} aria-hidden />
    </Dropdown.Trigger>
  );
};
