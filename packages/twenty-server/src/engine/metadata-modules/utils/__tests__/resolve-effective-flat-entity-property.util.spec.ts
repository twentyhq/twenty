import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';

type TestEntity = {
  title: string;
  position: number;
  icon: string | null;
  overrides?: Partial<TestEntity> | null;
};

describe('resolveEffectiveFlatEntityProperty', () => {
  it('should return override value when override exists for the property', () => {
    const entity: TestEntity = {
      title: 'Base Title',
      position: 0,
      icon: null,
      overrides: { title: 'Overridden Title' },
    };

    expect(resolveEffectiveFlatEntityProperty(entity, 'title')).toBe(
      'Overridden Title',
    );
  });

  it('should return base value when overrides is null', () => {
    const entity: TestEntity = {
      title: 'Base Title',
      position: 0,
      icon: null,
      overrides: null,
    };

    expect(resolveEffectiveFlatEntityProperty(entity, 'title')).toBe(
      'Base Title',
    );
  });

  it('should return base value when overrides exist but not for the requested property', () => {
    const entity: TestEntity = {
      title: 'Base Title',
      position: 0,
      icon: null,
      overrides: { position: 5 },
    };

    expect(resolveEffectiveFlatEntityProperty(entity, 'title')).toBe(
      'Base Title',
    );
  });

  it('should return base value when overrides is undefined', () => {
    const entity: TestEntity = {
      title: 'Base Title',
      position: 0,
      icon: null,
      overrides: undefined,
    };

    expect(resolveEffectiveFlatEntityProperty(entity, 'title')).toBe(
      'Base Title',
    );
  });

  it('should return null when override explicitly sets a nullable property to null', () => {
    const entity: TestEntity = {
      title: 'Base Title',
      position: 0,
      icon: 'IconStar',
      overrides: { icon: null },
    };

    expect(resolveEffectiveFlatEntityProperty(entity, 'icon')).toBeNull();
  });
});
