import { CountrySelectComponent } from './internal/CountrySelectComponent';
import { CountrySelectRoot } from './internal/CountrySelectRoot';
import { CountrySelectTrigger } from './internal/CountrySelectTrigger';
import { CountrySelectOptions } from './internal/CountrySelectOptions';

export const CountrySelect = Object.assign(CountrySelectComponent, {
  Root: CountrySelectRoot,
  Trigger: CountrySelectTrigger,
  Options: CountrySelectOptions,
});
