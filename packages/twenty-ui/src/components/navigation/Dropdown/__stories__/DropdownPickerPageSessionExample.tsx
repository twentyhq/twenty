import { CountrySelect } from '@ui/components/input/CountrySelect/CountrySelect';
import { COUNTRY_CHOICES } from '@ui/components/input/CountrySelect/__stories__/COUNTRY_CHOICES';
import { CurrencyPicker } from '@ui/components/input/CurrencyPicker/CurrencyPicker';
import { CURRENCY_PICKER_STORY_OPTIONS } from '@ui/components/input/CurrencyPicker/__stories__/currencyPickerStoryOptions';
import { PhoneCountryPicker } from '@ui/components/input/PhoneCountryPicker/PhoneCountryPicker';
import { PHONE_COUNTRY_OPTIONS } from '@ui/components/input/PhoneCountryPicker/__stories__/phoneCountryOptions';

import { Dropdown } from '../Dropdown';

export const DropdownPickerPageSessionExample = () => (
  <Dropdown.Root type="menu">
    <CountrySelect.Root countries={COUNTRY_CHOICES} defaultValue="FR">
      <CurrencyPicker.Root
        currencies={CURRENCY_PICKER_STORY_OPTIONS}
        defaultValue="USD"
        closeOnSelect={false}
      >
        <PhoneCountryPicker.Root
          countries={PHONE_COUNTRY_OPTIONS}
          defaultValue="FR"
          closeOnSelect={false}
        >
          <Dropdown.Trigger>Picker pages</Dropdown.Trigger>
          <Dropdown.Content aria-label="Picker pages" keepMounted width={280}>
            <Dropdown.Page id="root">
              <Dropdown.ActionItem page="country">Country</Dropdown.ActionItem>
              <Dropdown.ActionItem page="currency">
                Currency
              </Dropdown.ActionItem>
              <Dropdown.ActionItem page="phone">
                Phone country
              </Dropdown.ActionItem>
            </Dropdown.Page>
            <Dropdown.Page id="country" type="picker">
              <Dropdown.Back>Back to picker pages</Dropdown.Back>
              <CountrySelect.Options
                searchLabel="Find country"
                closeOnSelect={false}
              />
            </Dropdown.Page>
            <Dropdown.Page id="currency" type="picker">
              <Dropdown.Back>Back to picker pages</Dropdown.Back>
              <CurrencyPicker.Options searchLabel="Find currency" />
            </Dropdown.Page>
            <Dropdown.Page id="phone" type="picker">
              <Dropdown.Back>Back to picker pages</Dropdown.Back>
              <PhoneCountryPicker.Options searchLabel="Find phone country" />
            </Dropdown.Page>
          </Dropdown.Content>
        </PhoneCountryPicker.Root>
      </CurrencyPicker.Root>
    </CountrySelect.Root>
  </Dropdown.Root>
);
