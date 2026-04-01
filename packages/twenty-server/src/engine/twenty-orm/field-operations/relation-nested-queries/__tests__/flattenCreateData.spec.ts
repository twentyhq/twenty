import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { RelationNestedQueries } from 'src/engine/twenty-orm/field-operations/relation-nested-queries/relation-nested-queries';

/**
 * Helper to access the private `flattenCreateData` method for testing.
 * We instantiate the class with a minimal mock context and cast to `any`.
 */
function createTestInstance(): any {
  const mockContext = {} as WorkspaceInternalContext;

  return new RelationNestedQueries(mockContext);
}

describe('flattenCreateData', () => {
  const instance = createTestInstance();

  it('should flatten composite fields into camelCase column pairs', () => {
    const result = instance.flattenCreateData({
      name: { firstName: 'Xavier', lastName: 'Young' },
    });

    expect(result).toEqual([
      ['nameFirstName', 'Xavier'],
      ['nameLastName', 'Young'],
    ]);
  });

  it('should handle non-composite (scalar) fields', () => {
    const result = instance.flattenCreateData({
      dateOfBirth: '1969-05-11',
    });

    expect(result).toEqual([['dateOfBirth', '1969-05-11']]);
  });

  it('should skip null values', () => {
    const result = instance.flattenCreateData({
      dateOfBirth: null,
    });

    expect(result).toEqual([]);
  });

  it('should skip undefined values', () => {
    const result = instance.flattenCreateData({
      dateOfBirth: undefined,
    });

    expect(result).toEqual([]);
  });

  it('should skip empty string values', () => {
    const result = instance.flattenCreateData({
      dateOfBirth: '',
    });

    expect(result).toEqual([]);
  });

  it('should treat top-level arrays as scalar values (stringified)', () => {
    const result = instance.flattenCreateData({
      tags: ['a', 'b'],
    });

    // Arrays are not objects (Array.isArray check), so they fall through
    // to the scalar branch and get String()-ified
    expect(result).toEqual([['tags', 'a,b']]);
  });

  it('should skip empty sub-values inside composite fields', () => {
    const result = instance.flattenCreateData({
      name: { firstName: 'Xavier', lastName: '' },
    });

    expect(result).toEqual([['nameFirstName', 'Xavier']]);
  });

  it('should skip undefined sub-values inside composite fields', () => {
    const result = instance.flattenCreateData({
      name: { firstName: 'Xavier', lastName: undefined },
    });

    expect(result).toEqual([['nameFirstName', 'Xavier']]);
  });

  it('should handle mixed composite and non-composite fields', () => {
    const result = instance.flattenCreateData({
      name: { firstName: 'Fidencio', lastName: 'Garcia' },
      dateOfBirth: '1985-03-15',
      emails: { primaryEmail: 'fg@example.com' },
    });

    expect(result).toEqual([
      ['nameFirstName', 'Fidencio'],
      ['nameLastName', 'Garcia'],
      ['dateOfBirth', '1985-03-15'],
      ['emailsPrimaryEmail', 'fg@example.com'],
    ]);
  });

  it('should return an empty array for an empty object', () => {
    const result = instance.flattenCreateData({});

    expect(result).toEqual([]);
  });

  it('should convert numeric values to strings', () => {
    const result = instance.flattenCreateData({
      age: 42,
    });

    expect(result).toEqual([['age', '42']]);
  });

  it('should convert numeric sub-values to strings', () => {
    const result = instance.flattenCreateData({
      address: { zipCode: 90210 },
    });

    expect(result).toEqual([['addressZipCode', '90210']]);
  });
});
