import { removeAuthoredOverrideEntry } from 'src/engine/metadata-modules/overrides/utils/remove-authored-override-entry.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

describe('removeAuthoredOverrideEntry', () => {
  it('drops the author entry and keeps the others', () => {
    expect(
      removeAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: {
          [CUSTOM]: { label: 'Mine' },
          [OWNER]: { label: 'Theirs' },
        },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ [OWNER]: { label: 'Theirs' } });
  });

  it('returns null when the last entry goes', () => {
    expect(
      removeAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { label: 'Mine' } },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('lifts a legacy non-authored override before removing it', () => {
    expect(
      removeAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: { label: 'Legacy' },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('returns null for absent overrides and leaves other authors untouched', () => {
    expect(
      removeAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: null,
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
    expect(
      removeAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: { [OWNER]: { label: 'Theirs' } },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ [OWNER]: { label: 'Theirs' } });
  });
});
