import { describe, expect, it } from 'vitest';

import { matchesPhoneCountrySearch } from '../internal/matchesPhoneCountrySearch';

const REUNION = {
  value: 'RE',
  label: 'Réunion',
  callingCode: '262',
  flag: '🇷🇪',
  searchLabel: 'reunion',
  searchValue: 're',
};

const CANADA = {
  value: 'CA',
  label: 'Canada',
  callingCode: '1',
  flag: '🇨🇦',
  searchLabel: 'canada',
  searchValue: 'ca',
};

const UNITED_STATES = {
  value: 'US',
  label: 'United States',
  callingCode: '1',
  flag: '🇺🇸',
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
