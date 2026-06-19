import { isRecordArraySchema } from '@/logic-function/is-record-array-schema';

describe('isRecordArraySchema', () => {
  it('returns true for a records schema', () => {
    expect(
      isRecordArraySchema({
        type: 'records',
        objectUniversalIdentifier: 'person-universal-identifier',
      }),
    ).toBe(true);
  });

  it('returns false for a records schema without an objectUniversalIdentifier', () => {
    expect(isRecordArraySchema({ type: 'records' })).toBe(false);
  });

  it('returns true for the legacy array of record objects', () => {
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
    expect(isRecordArraySchema({ type: 'object' })).toBe(false);
    expect(isRecordArraySchema(undefined)).toBe(false);
  });
});
