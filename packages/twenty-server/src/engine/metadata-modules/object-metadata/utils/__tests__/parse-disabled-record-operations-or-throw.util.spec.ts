import { parseDisabledRecordOperationsOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/parse-disabled-record-operations-or-throw.util';

describe('parseDisabledRecordOperationsOrThrow', () => {
  it('should keep each known operation once', () => {
    expect(
      parseDisabledRecordOperationsOrThrow(['destroy', 'create', 'destroy']),
    ).toEqual(['destroy', 'create']);
  });

  it('should return null when nothing is disabled', () => {
    expect(parseDisabledRecordOperationsOrThrow(undefined)).toBeNull();
  });

  it('should reject unknown operations and non-array values', () => {
    expect(() => parseDisabledRecordOperationsOrThrow(['share'])).toThrow();
    expect(() =>
      parseDisabledRecordOperationsOrThrow({ read: false }),
    ).toThrow();
  });
});
