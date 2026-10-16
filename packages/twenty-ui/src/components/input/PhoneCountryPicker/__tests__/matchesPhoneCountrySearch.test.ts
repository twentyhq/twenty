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
  it.each(['reunion', ' RÉUNION ', 'rE', '262', '+262', '62', ''])(
    'matches a normalized label, identifier or calling code for %s',
    (search) => {
      expect(matchesPhoneCountrySearch({ country: REUNION, search })).toBe(
        true,
      );
    },
  );

  it('keeps countries sharing a calling code independently searchable', () => {
    expect(matchesPhoneCountrySearch({ country: CANADA, search: '+1' })).toBe(
      true,
    );
    expect(
      matchesPhoneCountrySearch({ country: UNITED_STATES, search: '+1' }),
    ).toBe(true);
    expect(matchesPhoneCountrySearch({ country: CANADA, search: 'us' })).toBe(
      false,
    );
    expect(
      matchesPhoneCountrySearch({ country: UNITED_STATES, search: 'us' }),
    ).toBe(true);
  });

  it.each(['+', '++262', '🇷🇪', 'France', 'RE +262'])(
    'does not match unsupported combined fields or flag content for %s',
    (search) => {
      expect(matchesPhoneCountrySearch({ country: REUNION, search })).toBe(
        false,
      );
    },
  );
});
