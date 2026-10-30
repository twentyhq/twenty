import { CountrySelectRoot } from './CountrySelectRoot';
import { CountrySelectDropdown } from './CountrySelectDropdown';
import { type CountrySelectProps } from '../types/CountrySelectProps';

export const CountrySelectComponent = ({
  countries,
  value,
  defaultValue,
  onValueChange,
  disabled,
  noCountryLabel,
  ...props
}: CountrySelectProps) => (
  <CountrySelectRoot
    countries={countries}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    disabled={disabled}
    noCountryLabel={noCountryLabel}
  >
    <CountrySelectDropdown
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  </CountrySelectRoot>
);
