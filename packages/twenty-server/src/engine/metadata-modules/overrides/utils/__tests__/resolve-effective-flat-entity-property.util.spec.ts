import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

type TestEntity = {
  applicationUniversalIdentifier: string;
  title: string;
  position: number;
  icon: string | null;
  overrides?: AuthoredOverrides<Partial<TestEntity>> | null;
};

const buildEntity = (
  overrides: TestEntity['overrides'],
  icon: string | null = null,
): TestEntity => ({
  applicationUniversalIdentifier: OWNER,
  title: 'Base Title',
  position: 0,
  icon,
  overrides,
});

describe('resolveEffectiveFlatEntityProperty', () => {
  it('should return the override value when an entry carries the property', () => {
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: buildEntity({ [CUSTOM]: { title: 'Overridden Title' } }),
        property: 'title',
      }),
    ).toBe('Overridden Title');
  });

  it('should return base value when overrides is null', () => {
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: buildEntity(null),
        property: 'title',
      }),
    ).toBe('Base Title');
  });

  it('should return base value when no entry carries the requested property', () => {
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: buildEntity({ [CUSTOM]: { position: 5 } }),
        property: 'title',
      }),
    ).toBe('Base Title');
  });

  it('should return base value when overrides is undefined', () => {
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: buildEntity(undefined),
        property: 'title',
      }),
    ).toBe('Base Title');
  });

  it('should return null when an entry explicitly sets a nullable property to null', () => {
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: buildEntity({ [CUSTOM]: { icon: null } }, 'IconStar'),
        property: 'icon',
      }),
    ).toBeNull();
  });

  it('should rank the workspace custom application entry before the owner entry', () => {
    const entity = buildEntity({
      [OWNER]: { title: 'Owner Title', position: 3 },
      [CUSTOM]: { title: 'Custom Title' },
    });

    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: entity,
        property: 'title',
      }),
    ).toBe('Custom Title');
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: entity,
        property: 'position',
      }),
    ).toBe(3);
    expect(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: entity,
        property: 'title',
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        },
      }),
    ).toBe('Custom Title');
  });
});
