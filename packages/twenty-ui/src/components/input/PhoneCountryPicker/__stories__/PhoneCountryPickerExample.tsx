import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { type DropdownSelectionGroupChangeEventDetails } from '@ui/components/navigation/Dropdown/types/DropdownSelectionGroupChangeEventDetails';
import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { PhoneCountryPicker } from '../PhoneCountryPicker';
import { type PhoneCountryOption } from '../types/PhoneCountryOption';
import { PHONE_COUNTRY_OPTIONS } from './phoneCountryOptions';

type PhoneCountryPickerExampleProps = {
  initialValue?: string | null;
  composition?: 'shorthand' | 'compound';
  controlled?: boolean;
  disabled?: boolean;
  label?: string;
  countries?: readonly PhoneCountryOption[];
  searchLabel?: string;
  listLabel?: string;
  emptyLabel?: string;
  onValueChange?: (
    value: string | null,
    eventDetails: DropdownSelectionGroupChangeEventDetails,
  ) => void;
};

export const PhoneCountryPickerExample = ({
  initialValue = 'FR',
  composition = 'shorthand',
  controlled = false,
  disabled = false,
  label = 'Phone country',
  countries = PHONE_COUNTRY_OPTIONS,
  searchLabel,
  listLabel,
  emptyLabel,
  onValueChange,
}: PhoneCountryPickerExampleProps) => {
  const [value, setValue] = useState(initialValue);
  const country = countries.find((choice) => choice.value === value);
  const handleValueChange = ({
    nextValue,
    eventDetails,
  }: {
    nextValue: string | null;
    eventDetails: DropdownSelectionGroupChangeEventDetails;
  }) => {
    onValueChange?.(nextValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    setValue(nextValue);
  };

  return (
    <Text
      style={{
        display: 'grid',
        alignContent: 'start',
        gap: 8,
        justifyItems: 'start',
      }}
    >
      <Text>{label}</Text>
      {composition === 'shorthand' ? (
        <PhoneCountryPicker
          aria-label={label}
          countries={countries}
          value={controlled ? value : undefined}
          defaultValue={initialValue}
          onValueChange={(nextValue, eventDetails) =>
            handleValueChange({ nextValue, eventDetails })
          }
          disabled={disabled}
          contentProps={{ 'aria-label': `${label} choices`, width: 280 }}
          optionsProps={{ searchLabel, listLabel, emptyLabel }}
        />
      ) : (
        <PhoneCountryPicker.Root
          countries={countries}
          value={controlled ? value : undefined}
          defaultValue={initialValue}
          onValueChange={(nextValue, eventDetails) =>
            handleValueChange({ nextValue, eventDetails })
          }
          disabled={disabled}
        >
          <Dropdown.Root type="picker">
            <PhoneCountryPicker.Trigger aria-label={label} />
            <Dropdown.Content aria-label={`${label} choices`} width={280}>
              <PhoneCountryPicker.Options
                searchLabel={searchLabel}
                listLabel={listLabel}
                emptyLabel={emptyLabel}
              />
            </Dropdown.Content>
          </Dropdown.Root>
        </PhoneCountryPicker.Root>
      )}
      <Text
        role="status"
        aria-label={`${label} selection`}
        style={{ color: themeCssVariables.font.color.secondary, fontSize: 12 }}
      >
        {isDefined(country)
          ? `${country.label} (+${country.callingCode})`
          : 'International'}
      </Text>
    </Text>
  );
};
