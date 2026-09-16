import { readAuthoredOverrideEntry } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-entry.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

describe('readAuthoredOverrideEntry', () => {
  it('returns the author entry only', () => {
    expect(
      readAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { isActive: false }, [OWNER]: { label: 'X' } },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ isActive: false });
  });

  it('lifts a legacy non-authored override under the custom key', () => {
    expect(
      readAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: { label: 'Legacy' },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ label: 'Legacy' });
  });

  it('returns undefined without an entry for the author', () => {
    expect(
      readAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: { [OWNER]: { label: 'X' } },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeUndefined();
    expect(
      readAuthoredOverrideEntry({
        metadataName: 'fieldMetadata',
        overrides: null,
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeUndefined();
  });
});
