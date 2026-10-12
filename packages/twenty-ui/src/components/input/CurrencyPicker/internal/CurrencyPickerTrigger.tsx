import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../CurrencyPicker.module.scss';
import { type CurrencyPickerTriggerProps } from '../types/CurrencyPickerTriggerProps';

export const CurrencyPickerTrigger = ({
  value,
  className,
  ...props
}: CurrencyPickerTriggerProps) => (
  <Dropdown.Trigger
    {...props}
    className={mergeClassNames(styles.trigger, className)}
  >
    {value}
    <IconChevronDown aria-hidden="true" className={styles.chevron} />
  </Dropdown.Trigger>
);
