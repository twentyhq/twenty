import { pickMorphGroupSurvivor } from '@/utils/fieldMetadata/pick-morph-group-survivor';

const makeMorphField = (overrides: {
  id: string;
  isActive?: boolean;
  isSystem?: boolean;
}) => ({
  isActive: true,
  isSystem: false,
  ...overrides,
});

describe('pickMorphGroupSurvivor', () => {
  it('should return the only field when group has one element', () => {
    const field = makeMorphField({ id: 'a' });

    expect(pickMorphGroupSurvivor([field])).toBe(field);
  });

  it('should prefer active non-system over active system', () => {
    const standard = makeMorphField({
      id: 'b',
      isActive: true,
      isSystem: false,
    });
    const system = makeMorphField({ id: 'a', isActive: true, isSystem: true });

    expect(pickMorphGroupSurvivor([system, standard])).toBe(standard);
  });

  it('should prefer active over inactive', () => {
    const active = makeMorphField({ id: 'b', isActive: true, isSystem: true });
    const inactive = makeMorphField({
      id: 'a',
      isActive: false,
      isSystem: false,
    });

    expect(pickMorphGroupSurvivor([inactive, active])).toBe(active);
  });

  it('should break ties by smallest id', () => {
    const fieldA = makeMorphField({ id: 'aaa' });
    const fieldB = makeMorphField({ id: 'bbb' });

    expect(pickMorphGroupSurvivor([fieldB, fieldA])).toBe(fieldA);
  });

  it('should treat nullish isActive/isSystem as falsy', () => {
    const nullishField = { id: 'a', isActive: null, isSystem: null };
    const activeField = makeMorphField({ id: 'b', isActive: true });

    expect(pickMorphGroupSurvivor([nullishField, activeField])).toBe(
      activeField,
    );
  });
});
