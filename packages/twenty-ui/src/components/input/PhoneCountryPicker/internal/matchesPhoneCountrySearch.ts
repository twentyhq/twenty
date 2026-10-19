import { isNonEmptyString } from '@sniptt/guards';

import { type PreparedPhoneCountryOption } from './PreparedPhoneCountryOption';

export const matchesPhoneCountrySearch = ({
  country,
  normalizedSearch,
  callingCodeSearch,
}: {
  country: Pick<
    PreparedPhoneCountryOption,
    'searchLabel' | 'searchValue' | 'callingCode'
  >;
  normalizedSearch: string;
  callingCodeSearch: string;
}) => {
  return (
    country.searchLabel.includes(normalizedSearch) ||
    country.searchValue.includes(normalizedSearch) ||
    (isNonEmptyString(callingCodeSearch) &&
      country.callingCode.includes(callingCodeSearch))
  );
};
