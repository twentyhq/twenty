import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const universalFlatViewField = {
  applicationUniversalIdentifier: OWNER,
  isActive: true,
  viewFieldGroupUniversalIdentifier: 'group-a',
  overrides: { [CUSTOM]: { isActive: false, viewFieldGroupId: 'group-b-id' } },
  universalOverrides: {
    [CUSTOM]: { isActive: false, viewFieldGroupUniversalIdentifier: 'group-b' },
  },
};

describe('resolveEffectiveUniversalFlatEntityProperty', () => {
  it('reads universalOverrides, not overrides', () => {
    expect(
      resolveEffectiveUniversalFlatEntityProperty(
        universalFlatViewField,
        'viewFieldGroupUniversalIdentifier',
      ),
    ).toBe('group-b');
    expect(
      resolveEffectiveUniversalFlatEntityProperty(
        universalFlatViewField,
        'isActive',
      ),
    ).toBe(false);
  });

  it('falls back to the column without a matching entry', () => {
    expect(
      resolveEffectiveUniversalFlatEntityProperty(
        { ...universalFlatViewField, universalOverrides: null },
        'isActive',
      ),
    ).toBe(true);
  });

  it('ranks the custom entry before the owner entry with an explicit context', () => {
    expect(
      resolveEffectiveUniversalFlatEntityProperty(
        {
          ...universalFlatViewField,
          universalOverrides: {
            [OWNER]: { isActive: false },
            [CUSTOM]: { isActive: true },
          },
        },
        'isActive',
        { workspaceCustomApplicationUniversalIdentifier: CUSTOM },
      ),
    ).toBe(true);
  });
});
