import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { CountrySelect } from '../CountrySelect';

runComponentConformance({
  name: 'CountrySelect',
  element: (
    <CountrySelect
      countries={[{ value: 'France', label: 'France' }]}
      value="France"
      onValueChange={() => undefined}
      labels={{
        search: 'Search',
        noCountry: 'No country',
        noResults: 'No results',
      }}
    />
  ),
  refInstanceOf: HTMLButtonElement,
  renderPropTagName: 'button',
});
