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
    expect(
      resolveEffectiveFlatEntity({
        metadataName: 'view',
        flatEntity: flatView,
      }),
    ).toEqual(flatView);
  });

  it('resolves every overridable property across author entries', () => {
    const overrides = {
      [CUSTOM]: { name: 'Mine' },
      [OWNER]: { name: 'Theirs', icon: 'IconStar', isActive: false },
    };

    expect(
      resolveEffectiveFlatEntity({
        metadataName: 'view',
        flatEntity: { ...flatView, overrides },
      }),
    ).toEqual({
      ...flatView,
      overrides,
      name: 'Mine',
      icon: 'IconStar',
      isActive: false,
    });
  });

  it('only walks the overridable properties of the given kind', () => {
    const overrides = { [CUSTOM]: { labelSingular: 'Société', name: 'Mine' } };

    expect(
      resolveEffectiveFlatEntity({
        metadataName: 'view',
        flatEntity: { ...flatView, labelSingular: 'Company', overrides },
      }),
    ).toEqual({
      ...flatView,
      labelSingular: 'Company',
      overrides,
      name: 'Mine',
    });
  });

  it('honours the workspace custom application order when given', () => {
    expect(
      resolveEffectiveFlatEntity({
        metadataName: 'view',
        flatEntity: {
          ...flatView,
          overrides: {
            [OWNER]: { name: 'Theirs' },
            [CUSTOM]: { name: 'Mine' },
          },
        },
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        },
      }).name,
    ).toBe('Mine');
  });
});
