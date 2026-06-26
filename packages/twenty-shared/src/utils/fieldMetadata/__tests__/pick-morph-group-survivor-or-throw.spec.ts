import { pickMorphGroupSurvivorOrThrow } from '@/utils/fieldMetadata/pick-morph-group-survivor-or-throw';

const makeMorphField = (overrides: {
  id: string;
  universalIdentifier?: string;
  isActive?: boolean;
  isSystem?: boolean;
}) => ({
  isActive: true,
  isSystem: false,
  universalIdentifier: overrides.id,
  ...overrides,
});

describe('pickMorphGroupSurvivorOrThrow', () => {
  it('should return the only field when group has one element', () => {
    const field = makeMorphField({ id: 'a' });

    expect(pickMorphGroupSurvivorOrThrow([field])).toBe(field);
  });

  it('should prefer active non-system over active system', () => {
    const standard = makeMorphField({
      id: 'b',
      isActive: true,
      isSystem: false,
    });
    const system = makeMorphField({ id: 'a', isActive: true, isSystem: true });

    expect(pickMorphGroupSurvivorOrThrow([system, standard])).toBe(standard);
  });

  it('should prefer active over inactive', () => {
    const active = makeMorphField({ id: 'b', isActive: true, isSystem: true });
    const inactive = makeMorphField({
      id: 'a',
      isActive: false,
      isSystem: false,
    });

    expect(pickMorphGroupSurvivorOrThrow([inactive, active])).toBe(active);
  });

  it('should break ties by smallest universalIdentifier, not by id', () => {
    const fieldA = makeMorphField({ id: 'zzz', universalIdentifier: 'aaa' });
    const fieldB = makeMorphField({ id: 'aaa', universalIdentifier: 'bbb' });

    expect(pickMorphGroupSurvivorOrThrow([fieldB, fieldA])).toBe(fieldA);
  });

  it('should treat nullish isActive/isSystem as falsy', () => {
    const nullishField = {
      id: 'a',
      universalIdentifier: 'a',
      isActive: null,
      isSystem: null,
    };
    const activeField = makeMorphField({ id: 'b', isActive: true });

    expect(pickMorphGroupSurvivorOrThrow([nullishField, activeField])).toBe(
      activeField,
    );
  });

  it('should throw on an empty group', () => {
    expect(() => pickMorphGroupSurvivorOrThrow([])).toThrow();
  });
});
