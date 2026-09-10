import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';

describe('isLegacyNonAuthoredOverride', () => {
  it('detects a flat entry by an overridable property name', () => {
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'fieldMetadata',
        overrides: { label: 'Société' },
      }),
    ).toBe(true);
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'fieldMetadata',
        overrides: { isActive: false },
      }),
    ).toBe(true);
  });

  it('detects a flat entry by its translations key', () => {
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'fieldMetadata',
        overrides: { translations: { fr: { label: 'X' } } },
      }),
    ).toBe(true);
  });

  it('detects a flat universal entry by a universal property name', () => {
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'viewField',
        overrides: {
          viewFieldGroupUniversalIdentifier: 'group-universal-identifier',
        },
      }),
    ).toBe(true);
  });

  it('does not flag an author map or an empty object', () => {
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { label: 'X' } },
      }),
    ).toBe(false);
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'fieldMetadata',
        overrides: { 'my-application': {} },
      }),
    ).toBe(false);
    expect(
      isLegacyNonAuthoredOverride({
        metadataName: 'fieldMetadata',
        overrides: {},
      }),
    ).toBe(false);
  });
});
