import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';

describe('isLegacyNonAuthoredOverride', () => {
  it('detects a flat entry by an overridable property name', () => {
    expect(isLegacyNonAuthoredOverride({ label: 'Société' })).toBe(true);
    expect(isLegacyNonAuthoredOverride({ isActive: false })).toBe(true);
  });

  it('detects a flat entry by its translations key', () => {
    expect(
      isLegacyNonAuthoredOverride({ translations: { fr: { label: 'X' } } }),
    ).toBe(true);
  });

  it('detects a flat universal entry by a universal property name', () => {
    expect(
      isLegacyNonAuthoredOverride({
        viewFieldGroupUniversalIdentifier: 'group-universal-identifier',
      }),
    ).toBe(true);
  });

  it('does not flag an author map or an empty object', () => {
    expect(isLegacyNonAuthoredOverride({ [CUSTOM]: { label: 'X' } })).toBe(
      false,
    );
    expect(isLegacyNonAuthoredOverride({ 'my-application': {} })).toBe(false);
    expect(isLegacyNonAuthoredOverride({})).toBe(false);
  });
});
