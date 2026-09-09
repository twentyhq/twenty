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
      resolveEffectiveFlatEntityProperty(
        buildEntity({ [CUSTOM]: { title: 'Overridden Title' } }),
        'title',
      ),
    ).toBe('Overridden Title');
  });

  it('should return base value when overrides is null', () => {
    expect(resolveEffectiveFlatEntityProperty(buildEntity(null), 'title')).toBe(
      'Base Title',
    );
  });

  it('should return base value when no entry carries the requested property', () => {
    expect(
      resolveEffectiveFlatEntityProperty(
        buildEntity({ [CUSTOM]: { position: 5 } }),
        'title',
      ),
    ).toBe('Base Title');
  });

  it('should return base value when overrides is undefined', () => {
    expect(
      resolveEffectiveFlatEntityProperty(buildEntity(undefined), 'title'),
    ).toBe('Base Title');
  });

  it('should return null when an entry explicitly sets a nullable property to null', () => {
    expect(
      resolveEffectiveFlatEntityProperty(
        buildEntity({ [CUSTOM]: { icon: null } }, 'IconStar'),
        'icon',
      ),
    ).toBeNull();
  });

  it('should rank the workspace custom application entry before the owner entry', () => {
    const entity = buildEntity({
      [OWNER]: { title: 'Owner Title', position: 3 },
      [CUSTOM]: { title: 'Custom Title' },
    });

    expect(resolveEffectiveFlatEntityProperty(entity, 'title')).toBe(
      'Custom Title',
    );
    expect(resolveEffectiveFlatEntityProperty(entity, 'position')).toBe(3);
    expect(
      resolveEffectiveFlatEntityProperty(entity, 'title', {
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBe('Custom Title');
  });

  it('should read a flat blob as the workspace custom application entry', () => {
    const entity = buildEntity({ title: 'Legacy Title' } as never);

    expect(resolveEffectiveFlatEntityProperty(entity, 'title')).toBe(
      'Legacy Title',
    );
    expect(
      resolveEffectiveFlatEntityProperty(entity, 'title', {
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBe('Legacy Title');
  });
});
