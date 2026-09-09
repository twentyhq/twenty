import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/utils/normalize-authored-overrides.util';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = 'my-application';

describe('normalizeAuthoredOverrides', () => {
  it('returns null for an absent blob', () => {
    expect(
      normalizeAuthoredOverrides({
        overrides: null,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('lifts a flat blob under the workspace custom application key', () => {
    expect(
      normalizeAuthoredOverrides({
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
        overrides,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBe(overrides);
  });
});

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
        overrides,
        path: ['label'],
        authorContext,
      }),
    ).toBe('Société');
    expect(
      readAuthoredOverrideProperty({
        overrides,
        path: ['icon'],
        authorContext,
      }),
    ).toBe('IconBuilding');
  });

  it('ranks non-owner entries first when only the owner is known', () => {
    expect(
      readAuthoredOverrideProperty({
        overrides,
        path: ['label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBe('Société');
  });

  it('reads a legacy non-authored override as the one non-owner entry', () => {
    expect(
      readAuthoredOverrideProperty({
        overrides: { label: 'Legacy' },
        path: ['label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBe('Legacy');
  });

  it('reads a nested translation path', () => {
    expect(
      readAuthoredOverrideProperty({
        overrides: { [CUSTOM]: { translations: { fr: { label: 'Société' } } } },
        path: ['translations', 'fr', 'label'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBe('Société');
  });

  it('keeps an explicit null and falls through an absent key', () => {
    expect(
      readAuthoredOverrideProperty({
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
        overrides,
        path: ['description'],
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toBeUndefined();
  });
});
