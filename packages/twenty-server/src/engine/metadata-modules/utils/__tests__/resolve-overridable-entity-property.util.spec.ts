import { resolveOverridableEntityProperty } from 'src/engine/metadata-modules/utils/resolve-overridable-entity-property.util';

type TestEntity = {
  title: string;
  position: number;
  icon: string | null;
  overrides?: Partial<TestEntity> | null;
};

describe('resolveOverridableEntityProperty', () => {
  it('should return override value when override exists for the property', () => {
    const entity: TestEntity = {
      title: 'Base Title',
      position: 0,
      icon: null,
      overrides: { title: 'Overridden Title' },
    };

    expect(resolveOverridableEntityProperty(entity, 'title')).toBe(
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

    expect(resolveOverridableEntityProperty(entity, 'title')).toBe(
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

    expect(resolveOverridableEntityProperty(entity, 'title')).toBe(
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

    expect(resolveOverridableEntityProperty(entity, 'title')).toBe(
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

    expect(resolveOverridableEntityProperty(entity, 'icon')).toBeNull();
  });
});
