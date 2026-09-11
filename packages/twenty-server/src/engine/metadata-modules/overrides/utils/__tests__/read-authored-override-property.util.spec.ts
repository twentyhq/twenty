import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = 'my-application';

describe('readAuthoredOverrideProperty', () => {
  const overrides = {
    [OWNER]: { label: 'Account', icon: 'IconBuilding' },
    [CUSTOM]: { label: 'Société' },
  };

  it('reads the custom entry before the owner entry with an explicit context', () => {
    const authorContext = {
      workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      ownerApplicationUniversalIdentifier: OWNER,
    };

    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides,
        path: ['label'],
        authorContext,
      }),
    ).toBe('Société');
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides,
        path: ['icon'],
        authorContext,
      }),
    ).toBe('IconBuilding');
  });

  it('ranks non-owner entries first when only the owner is known', () => {
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides,
        path: ['label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBe('Société');
  });

  it('reads a legacy non-authored override as the one non-owner entry', () => {
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides: { label: 'Legacy' },
        path: ['label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBe('Legacy');
  });

  it('reads a nested translation path', () => {
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { translations: { fr: { label: 'Société' } } } },
        path: ['translations', 'fr', 'label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBe('Société');
  });

  it('keeps an explicit null and falls through an absent key', () => {
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { icon: null }, [OWNER]: { icon: 'IconX' } },
        path: ['icon'],
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
          ownerApplicationUniversalIdentifier: OWNER,
        },
      }),
    ).toBeNull();
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides,
        path: ['description'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBeUndefined();
  });

  it('dedupes when the owner is the workspace custom application', () => {
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { label: 'Mine' } },
        path: ['label'],
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
          ownerApplicationUniversalIdentifier: CUSTOM,
        },
      }),
    ).toBe('Mine');
  });

  it('returns undefined for absent or non-object overrides', () => {
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides: null,
        path: ['label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBeUndefined();
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides: { [CUSTOM]: { translations: 'broken' } },
        path: ['translations', 'fr', 'label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBeUndefined();
  });
});
