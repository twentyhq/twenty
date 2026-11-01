import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { PhoneCountryPickerOptions } from './internal/PhoneCountryPickerOptions';
import { PhoneCountryPickerRoot } from './internal/PhoneCountryPickerRoot';
import { PhoneCountryPickerTrigger } from './internal/PhoneCountryPickerTrigger';
import { type PhoneCountryPickerProps } from './types/PhoneCountryPickerProps';

const PhoneCountryPickerShorthand = ({
  countries,
  value,
  defaultValue,
  onValueChange,
  disabled,
  closeOnSelect,
  dropdownProps,
  contentProps,
  optionsProps,
  ...triggerProps
}: PhoneCountryPickerProps) => (
  <PhoneCountryPickerRoot
    countries={countries}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    disabled={disabled}
    closeOnSelect={closeOnSelect}
  >
    <Dropdown.Root
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...dropdownProps}
      type="picker"
    >
      <PhoneCountryPickerTrigger
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...triggerProps}
      />
      <Dropdown.Content
        width={280}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...contentProps}
      >
        <PhoneCountryPickerOptions
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...optionsProps}
        />
      </Dropdown.Content>
    </Dropdown.Root>
  </PhoneCountryPickerRoot>
);

export const PhoneCountryPicker = Object.assign(PhoneCountryPickerShorthand, {
  Root: PhoneCountryPickerRoot,
  Trigger: PhoneCountryPickerTrigger,
  Options: PhoneCountryPickerOptions,
});
