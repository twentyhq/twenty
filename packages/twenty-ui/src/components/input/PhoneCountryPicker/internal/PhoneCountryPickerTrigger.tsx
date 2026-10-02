import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown, IconWorld } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../PhoneCountryPicker.module.scss';
import { type PhoneCountryPickerTriggerProps } from '../types/PhoneCountryPickerTriggerProps';

export const PhoneCountryPickerTrigger = ({
  country,
  className,
  ...props
}: PhoneCountryPickerTriggerProps) => (
  <Dropdown.Trigger
    {...props}
    className={mergeClassNames(styles.trigger, className)}
  >
    <span className={styles.triggerFlag} aria-hidden>
      {country?.flag ?? <IconWorld />}
    </span>
    <IconChevronDown className={styles.chevron} aria-hidden />
  </Dropdown.Trigger>
);
