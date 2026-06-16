import { convertRecordInputsToToolSchema } from '@/logic-function/convert-record-inputs-to-tool-schema';

describe('convertRecordInputsToToolSchema', () => {
  it('should convert a record-typed object to an id string with a resolved label', () => {
    const result = convertRecordInputsToToolSchema(
      {
        type: 'object',
        objectUniversalIdentifier: 'company-universal-identifier',
      },
      (universalIdentifier) =>
        universalIdentifier === 'company-universal-identifier'
          ? 'Company'
          : undefined,
    );

    expect(result).toEqual({
      type: 'string',
      description: 'Id of the Company record',
    });
  });

  it('should fall back to a generic label when none resolves', () => {
    expect(
      convertRecordInputsToToolSchema({
        type: 'object',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toEqual({
      type: 'string',
      description: 'Id of the linked record',
    });
  });

  it('should convert arrays of records to arrays of id strings', () => {
    const result = convertRecordInputsToToolSchema(
      {
        type: 'array',
        items: {
          type: 'object',
          objectUniversalIdentifier: 'person-universal-identifier',
        },
      },
      () => 'Person',
    );

    expect(result).toEqual({
      type: 'array',
      items: { type: 'string', description: 'Id of the Person record' },
    });
  });

  it('should recurse into properties and leave non-record nodes untouched', () => {
    const result = convertRecordInputsToToolSchema(
      {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            objectUniversalIdentifier: 'company-universal-identifier',
          },
          note: { type: 'string', multiline: true },
          plainObject: { type: 'object' },
        },
      },
      () => 'Company',
    );

    expect(result).toEqual({
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Id of the Company record' },
        note: { type: 'string', multiline: true },
        plainObject: { type: 'object' },
      },
    });
  });
});
