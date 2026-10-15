import { isNonEmptyString } from '@sniptt/guards';

import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';

import { type PreparedPhoneCountryOption } from './PreparedPhoneCountryOption';

export const matchesPhoneCountrySearch = ({
  country,
  search,
}: {
  country: PreparedPhoneCountryOption;
  search: string;
}) => {
  const normalizedSearch = normalizeSearchText(search).trim();
  const callingCodeSearch = normalizedSearch.startsWith('+')
    ? normalizedSearch.slice(1)
    : normalizedSearch;

  return (
    country.searchLabel.includes(normalizedSearch) ||
    country.searchValue.includes(normalizedSearch) ||
    (isNonEmptyString(callingCodeSearch) &&
      country.callingCode.includes(callingCodeSearch))
  );
};
