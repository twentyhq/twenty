import { parseDisabledRecordOperations } from 'src/engine/metadata-modules/object-metadata/utils/parse-disabled-record-operations.util';

describe('parseDisabledRecordOperations', () => {
  it('should keep each known operation once', () => {
    expect(
      parseDisabledRecordOperations(['destroy', 'create', 'destroy']),
    ).toEqual(['destroy', 'create']);
  });

  it('should return null when nothing is disabled', () => {
    expect(parseDisabledRecordOperations(undefined)).toBeNull();
  });

  it('should reject unknown operations and non-array values', () => {
    expect(() => parseDisabledRecordOperations(['share'])).toThrow();
    expect(() => parseDisabledRecordOperations({ read: false })).toThrow();
  });
});
