import { isRecordObjectSchema } from '@/logic-function/is-record-object-schema';

describe('isRecordObjectSchema', () => {
  it('returns true for a record schema', () => {
    expect(
      isRecordObjectSchema({
        type: 'record',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(true);
  });

  it('returns true for the legacy object+marker schema', () => {
    expect(
      isRecordObjectSchema({
        type: 'object',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(true);
  });

  it('returns false for a record schema without an objectUniversalIdentifier', () => {
    expect(isRecordObjectSchema({ type: 'record' })).toBe(false);
  });

  it('returns false for a plain object schema', () => {
    expect(isRecordObjectSchema({ type: 'object' })).toBe(false);
    expect(
      isRecordObjectSchema({ type: 'object', objectUniversalIdentifier: '' }),
    ).toBe(false);
  });

  it('returns false for non-object schemas and nullish input', () => {
    expect(
      isRecordObjectSchema({
        type: 'string',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(false);
    expect(isRecordObjectSchema(undefined)).toBe(false);
    expect(isRecordObjectSchema(null)).toBe(false);
  });
});
