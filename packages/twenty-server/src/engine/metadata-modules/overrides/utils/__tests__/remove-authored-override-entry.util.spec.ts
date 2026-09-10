import { removeAuthoredOverrideEntry } from 'src/engine/metadata-modules/overrides/utils/remove-authored-override-entry.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

describe('removeAuthoredOverrideEntry', () => {
  it('drops the author entry and keeps the others', () => {
    expect(
      removeAuthoredOverrideEntry({
        overrides: {
          [CUSTOM]: { label: 'Mine' },
          [OWNER]: { label: 'Theirs' },
        },
        authorUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ [OWNER]: { label: 'Theirs' } });
  });

  it('returns null when the last entry goes', () => {
    expect(
      removeAuthoredOverrideEntry({
        overrides: { [CUSTOM]: { label: 'Mine' } },
        authorUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('returns null for absent overrides and leaves other authors untouched', () => {
    expect(
      removeAuthoredOverrideEntry({
        overrides: null,
        authorUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
    expect(
      removeAuthoredOverrideEntry({
        overrides: { [OWNER]: { label: 'Theirs' } },
        authorUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ [OWNER]: { label: 'Theirs' } });
  });
});
