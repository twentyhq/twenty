import {
  isRecordArraySchema,
  isRecordObjectSchema,
} from '@/logic-function/is-record-input-schema';

describe('isRecordObjectSchema', () => {
  it('returns true for an object schema with an objectUniversalIdentifier', () => {
    expect(
      isRecordObjectSchema({
        type: 'object',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(true);
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

describe('isRecordArraySchema', () => {
  it('returns true for an array whose items are record objects', () => {
    expect(
      isRecordArraySchema({
        type: 'array',
        items: {
          type: 'object',
          objectUniversalIdentifier: 'person-universal-identifier',
        },
      }),
    ).toBe(true);
  });

  it('returns false for an array of plain objects', () => {
    expect(
      isRecordArraySchema({ type: 'array', items: { type: 'object' } }),
    ).toBe(false);
  });

  it('returns false for non-array schemas and nullish input', () => {
    expect(
      isRecordArraySchema({
        type: 'object',
        objectUniversalIdentifier: 'person-universal-identifier',
      }),
    ).toBe(false);
    expect(isRecordArraySchema(undefined)).toBe(false);
  });
});
