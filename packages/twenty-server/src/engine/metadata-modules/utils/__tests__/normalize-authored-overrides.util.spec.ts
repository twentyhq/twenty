import { listAuthoredOverrideEntries } from 'src/engine/metadata-modules/utils/list-authored-override-entries.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/utils/normalize-authored-overrides.util';

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

describe('listAuthoredOverrideEntries', () => {
  const overrides = {
    [OWNER]: { label: 'Account' },
    [CUSTOM]: { label: 'Société' },
  };

  it('orders the custom entry before the owner entry with an explicit context', () => {
    expect(
      listAuthoredOverrideEntries({
        overrides,
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
          ownerApplicationUniversalIdentifier: OWNER,
        },
      }),
    ).toEqual([{ label: 'Société' }, { label: 'Account' }]);
  });

  it('ranks non-owner entries first when only the owner is known', () => {
    expect(
      listAuthoredOverrideEntries({
        overrides,
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toEqual([{ label: 'Société' }, { label: 'Account' }]);
  });

  it('reads a flat blob as the one non-owner entry', () => {
    expect(
      listAuthoredOverrideEntries({
        overrides: { label: 'Legacy' },
        authorContext: { ownerApplicationUniversalIdentifier: OWNER },
      }),
    ).toEqual([{ label: 'Legacy' }]);
  });

  it('dedupes when the owner is the workspace custom application', () => {
    expect(
      listAuthoredOverrideEntries({
        overrides: { [CUSTOM]: { label: 'Mine' } },
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
          ownerApplicationUniversalIdentifier: CUSTOM,
        },
      }),
    ).toEqual([{ label: 'Mine' }]);
  });
});
