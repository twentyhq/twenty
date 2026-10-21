import { type CountrySelectRootProps } from '../types/CountrySelectRootProps';
import { type PreparedCountryChoice } from './PreparedCountryChoice';

export type CountrySelectContextValue = {
  countries: readonly PreparedCountryChoice[];
  selectedCountry: PreparedCountryChoice | undefined;
  value: string | null;
  disabled: boolean;
  noCountryLabel: string;
  selectionGroupId: string;
  changeValue: NonNullable<CountrySelectRootProps['onValueChange']>;
};
