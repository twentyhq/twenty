import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = 'my-application';

describe('normalizeAuthoredOverrides', () => {
  it('returns null for an absent blob', () => {
    expect(
      normalizeAuthoredOverrides({
        metadataName: 'fieldMetadata',
        overrides: null,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('lifts a flat blob under the workspace custom application key', () => {
    expect(
      normalizeAuthoredOverrides({
        metadataName: 'fieldMetadata',
        overrides: { label: 'Société', translations: { 'fr-FR': {} } },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      [CUSTOM]: { label: 'Société', translations: { 'fr-FR': {} } },
    });
  });

  it('lifts a flat universal blob too', () => {
    expect(
      normalizeAuthoredOverrides({
        metadataName: 'viewField',
        overrides: { viewFieldGroupUniversalIdentifier: 'group' },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ [CUSTOM]: { viewFieldGroupUniversalIdentifier: 'group' } });
  });

  it('returns an author-keyed blob as is, whatever the identifier format', () => {
    const overrides = {
      [OWNER]: { label: 'Account' },
      [CUSTOM]: { icon: 'x' },
    };

    expect(
      normalizeAuthoredOverrides({
        metadataName: 'fieldMetadata',
        overrides,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBe(overrides);
  });
});
