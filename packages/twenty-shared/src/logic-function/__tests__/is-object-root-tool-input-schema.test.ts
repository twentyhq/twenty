import { isObjectRootToolInputSchema } from '@/logic-function/is-object-root-tool-input-schema';

describe('isObjectRootToolInputSchema', () => {
  it('returns true for a plain object schema', () => {
    expect(
      isObjectRootToolInputSchema({
        type: 'object',
        properties: { name: { type: 'string' } },
      }),
    ).toBe(true);
  });

  it('returns true for a schema without a type', () => {
    expect(
      isObjectRootToolInputSchema({ properties: { name: { type: 'string' } } }),
    ).toBe(true);
  });

  it('returns false for a record root, which tools advertise as a string id', () => {
    expect(
      isObjectRootToolInputSchema({
        type: 'record',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(false);
    expect(
      isObjectRootToolInputSchema({
        type: 'object',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(false);
  });

  it('returns false for records, array and scalar roots', () => {
    expect(
      isObjectRootToolInputSchema({
        type: 'records',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toBe(false);
    expect(
      isObjectRootToolInputSchema({
        type: 'array',
        items: { type: 'string' },
      }),
    ).toBe(false);
    expect(isObjectRootToolInputSchema({ type: 'string' })).toBe(false);
  });
});
