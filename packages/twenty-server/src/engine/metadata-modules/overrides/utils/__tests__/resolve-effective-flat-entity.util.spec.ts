import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const flatView = {
  applicationUniversalIdentifier: OWNER,
  name: 'All companies',
  icon: 'IconList',
  isActive: true,
  position: 0,
  overrides: null as unknown,
};

describe('resolveEffectiveFlatEntity', () => {
  it('returns the entity as is without overrides', () => {
    expect(resolveEffectiveFlatEntity(flatView)).toEqual(flatView);
  });

  it('resolves every overridable property across author entries', () => {
    const overrides = {
      [CUSTOM]: { name: 'Mine' },
      [OWNER]: { name: 'Theirs', icon: 'IconStar', isActive: false },
    };

    expect(resolveEffectiveFlatEntity({ ...flatView, overrides })).toEqual({
      ...flatView,
      overrides,
      name: 'Mine',
      icon: 'IconStar',
      isActive: false,
    });
  });

  it('ignores entry keys that are not overridable properties', () => {
    const overrides = { [CUSTOM]: { unknownKey: 'x' } };

    expect(resolveEffectiveFlatEntity({ ...flatView, overrides })).toEqual({
      ...flatView,
      overrides,
    });
  });

  it('honours the workspace custom application order when given', () => {
    expect(
      resolveEffectiveFlatEntity(
        {
          ...flatView,
          overrides: {
            [OWNER]: { name: 'Theirs' },
            [CUSTOM]: { name: 'Mine' },
          },
        },
        { workspaceCustomApplicationUniversalIdentifier: CUSTOM },
      ).name,
    ).toBe('Mine');
  });
});
