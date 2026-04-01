import {
  stringSimilarity,
  jaroSimilarity,
  isRecord,
  getProperty,
  getSchemaQualifiedTable,
} from 'src/engine/twenty-orm/field-operations/relation-nested-queries/relation-nested-queries';

describe('stringSimilarity (Jaro-Winkler)', () => {
  it('should return 1.0 for identical strings', () => {
    expect(stringSimilarity('hello', 'hello')).toBe(1.0);
  });

  it('should return a low score for completely different strings', () => {
    expect(stringSimilarity('abc', 'xyz')).toBeLessThan(0.5);
  });

  it('should return 1.0 for two empty strings (identity match)', () => {
    expect(stringSimilarity('', '')).toBe(1.0);
  });

  it('should return 0.0 when only one string is empty', () => {
    expect(stringSimilarity('hello', '')).toBe(0.0);
    expect(stringSimilarity('', 'hello')).toBe(0.0);
  });

  it('should return 1.0 for "leigh barnett" vs "leigh barnett"', () => {
    expect(stringSimilarity('leigh barnett', 'leigh barnett')).toBe(1.0);
  });

  it('should return < 0.95 for "leigh barnett" vs "marcus barnett"', () => {
    const score = stringSimilarity('leigh barnett', 'marcus barnett');

    expect(score).toBeLessThan(0.95);
  });

  it('should return > 0.95 for "leigh barnett" vs "leiggh barnett" (typo)', () => {
    const score = stringSimilarity('leigh barnett', 'leiggh barnett');

    expect(score).toBeGreaterThan(0.95);
  });

  it('should return 1.0 for "fidencio garcia" vs "fidencio garcia"', () => {
    expect(stringSimilarity('fidencio garcia', 'fidencio garcia')).toBe(1.0);
  });

  it('should distinguish case-sensitive strings (inputs are pre-lowercased)', () => {
    // The function itself is case-sensitive; callers lowercase before calling
    const score = stringSimilarity('Leigh Barnett', 'leigh barnett');

    expect(score).toBeLessThan(1.0);
  });
});

describe('jaroSimilarity', () => {
  it('should return 1.0 for identical strings', () => {
    expect(jaroSimilarity('hello', 'hello')).toBe(1.0);
  });

  it('should return 0 when there are no matching characters', () => {
    expect(jaroSimilarity('abc', 'xyz')).toBe(0);
  });

  it('should return a value between 0 and 1 for partially matching strings', () => {
    const score = jaroSimilarity('martha', 'marhta');

    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});

describe('isRecord', () => {
  it('should return true for a plain object', () => {
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it('should return true for an empty object', () => {
    expect(isRecord({})).toBe(true);
  });

  it('should return false for null', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isRecord(undefined)).toBe(false);
  });

  it('should return false for an array', () => {
    expect(isRecord([1, 2, 3])).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isRecord('hello')).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isRecord(42)).toBe(false);
  });
});

describe('getProperty', () => {
  it('should return the value for an existing key', () => {
    expect(getProperty({ foo: 'bar' }, 'foo')).toBe('bar');
  });

  it('should return undefined for a missing key', () => {
    expect(getProperty({ foo: 'bar' }, 'baz')).toBeUndefined();
  });

  it('should return undefined values as-is', () => {
    expect(getProperty({ key: undefined }, 'key')).toBeUndefined();
  });

  it('should return null values as-is', () => {
    expect(getProperty({ key: null }, 'key')).toBeNull();
  });
});

describe('getSchemaQualifiedTable', () => {
  it('should return schema-qualified table name when metadata has a schema', () => {
    const mockQueryBuilder = {
      connection: {
        entityMetadatas: [
          {
            name: 'PersonEntity',
            tableName: 'person',
            schema: 'workspace_abc123',
          },
        ],
      },
    } as any;

    const result = getSchemaQualifiedTable(mockQueryBuilder, 'PersonEntity');

    expect(result).toBe('"workspace_abc123"."person"');
  });

  it('should match by tableName when name does not match', () => {
    const mockQueryBuilder = {
      connection: {
        entityMetadatas: [
          {
            name: 'SomeOtherName',
            tableName: 'person',
            schema: 'my_schema',
          },
        ],
      },
    } as any;

    const result = getSchemaQualifiedTable(mockQueryBuilder, 'person');

    expect(result).toBe('"my_schema"."person"');
  });

  it('should fall back to bare table name when no metadata matches', () => {
    const mockQueryBuilder = {
      connection: {
        entityMetadatas: [
          {
            name: 'CompanyEntity',
            tableName: 'company',
            schema: 'workspace_abc123',
          },
        ],
      },
    } as any;

    const result = getSchemaQualifiedTable(
      mockQueryBuilder,
      'nonExistentTable',
    );

    expect(result).toBe('"nonExistentTable"');
  });

  it('should fall back to bare table name when metadata has no schema', () => {
    const mockQueryBuilder = {
      connection: {
        entityMetadatas: [
          {
            name: 'PersonEntity',
            tableName: 'person',
            schema: undefined,
          },
        ],
      },
    } as any;

    const result = getSchemaQualifiedTable(mockQueryBuilder, 'PersonEntity');

    expect(result).toBe('"PersonEntity"');
  });

  it('should fall back when entityMetadatas is empty', () => {
    const mockQueryBuilder = {
      connection: {
        entityMetadatas: [],
      },
    } as any;

    const result = getSchemaQualifiedTable(mockQueryBuilder, 'person');

    expect(result).toBe('"person"');
  });
});
