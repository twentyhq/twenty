import { describe, expect, it } from 'vitest';

import { matchesPhoneCountrySearch } from '../internal/matchesPhoneCountrySearch';

const REUNION = {
  callingCode: '262',
  searchLabel: 'reunion',
  searchValue: 're',
};

const CANADA = {
  callingCode: '1',
  searchLabel: 'canada',
  searchValue: 'ca',
};

const UNITED_STATES = {
  callingCode: '1',
  searchLabel: 'united states',
  searchValue: 'us',
};

describe('matchesPhoneCountrySearch', () => {
  it.each(['reunion', 're', '262', '62', ''])(
    'matches a prepared label, identifier or calling code for %s',
    (normalizedSearch) => {
      expect(
        matchesPhoneCountrySearch({
          country: REUNION,
          normalizedSearch,
          callingCodeSearch: normalizedSearch,
        }),
      ).toBe(true);
    },
  );

  it('keeps countries sharing a calling code independently searchable', () => {
    expect(
      matchesPhoneCountrySearch({
        country: CANADA,
        normalizedSearch: '+1',
        callingCodeSearch: '1',
      }),
    ).toBe(true);
    expect(
      matchesPhoneCountrySearch({
        country: UNITED_STATES,
        normalizedSearch: '+1',
        callingCodeSearch: '1',
      }),
    ).toBe(true);
    expect(
      matchesPhoneCountrySearch({
        country: CANADA,
        normalizedSearch: 'us',
        callingCodeSearch: 'us',
      }),
    ).toBe(false);
    expect(
      matchesPhoneCountrySearch({
        country: UNITED_STATES,
        normalizedSearch: 'us',
        callingCodeSearch: 'us',
      }),
    ).toBe(true);
  });

  it.each([
    { normalizedSearch: '+', callingCodeSearch: '' },
    { normalizedSearch: '++262', callingCodeSearch: '+262' },
    { normalizedSearch: '🇷🇪', callingCodeSearch: '🇷🇪' },
    { normalizedSearch: 'france', callingCodeSearch: 'france' },
    { normalizedSearch: 're +262', callingCodeSearch: 're +262' },
  ])(
    'does not match unsupported combined fields or flag content for $normalizedSearch',
    ({ normalizedSearch, callingCodeSearch }) => {
      expect(
        matchesPhoneCountrySearch({
          country: REUNION,
          normalizedSearch,
          callingCodeSearch,
        }),
      ).toBe(false);
    },
  );
});
