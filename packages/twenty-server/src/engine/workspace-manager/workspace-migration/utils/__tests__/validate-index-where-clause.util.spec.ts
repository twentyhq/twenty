import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';

describe('validateAndReturnIndexWhereClause', () => {
  it('should return undefined for null/undefined/empty input', () => {
    expect(validateAndReturnIndexWhereClause(null)).toBeUndefined();
    expect(validateAndReturnIndexWhereClause(undefined)).toBeUndefined();
    expect(validateAndReturnIndexWhereClause('')).toBeUndefined();
  });

  it('should return the clause when it is in the allowlist', () => {
    expect(validateAndReturnIndexWhereClause('"deletedAt" IS NULL')).toBe(
      '"deletedAt" IS NULL',
    );
  });

  it('should throw for clauses not in the allowlist', () => {
    expect(() =>
      validateAndReturnIndexWhereClause('1=1; DROP TABLE users;'),
    ).toThrow('Unsupported index WHERE clause');
  });

  it('should throw for subtle variants of allowed clauses', () => {
    expect(() =>
      validateAndReturnIndexWhereClause('"deletedAt" IS NOT NULL'),
    ).toThrow('Unsupported index WHERE clause');
  });
});
