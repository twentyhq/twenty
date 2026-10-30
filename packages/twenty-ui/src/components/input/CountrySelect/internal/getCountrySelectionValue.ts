const COUNTRY_SELECTION_VALUE_PREFIX = 'country:';

export const getCountrySelectionValue = (value: string) =>
  `${COUNTRY_SELECTION_VALUE_PREFIX}${value}`;
