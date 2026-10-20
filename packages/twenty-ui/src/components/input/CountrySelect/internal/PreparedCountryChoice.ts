import { type CountryChoice } from '../types/CountryChoice';

export type PreparedCountryChoice = CountryChoice & {
  selectionValue: string;
  searchText: string;
};
