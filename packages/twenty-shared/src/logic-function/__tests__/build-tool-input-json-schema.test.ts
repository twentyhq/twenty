import { buildToolInputJsonSchema } from '@/logic-function/build-tool-input-json-schema';

describe('buildToolInputJsonSchema', () => {
  it('should collapse a record-typed object to an id string with a resolved label', () => {
    const result = buildToolInputJsonSchema(
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
      buildToolInputJsonSchema({
        type: 'object',
        objectUniversalIdentifier: 'company-universal-identifier',
      }),
    ).toEqual({
      type: 'string',
      description: 'Id of the linked record',
    });
  });

  it('should collapse arrays of records to arrays of id strings', () => {
    const result = buildToolInputJsonSchema(
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

  it('should collapse a record type to an id string', () => {
    expect(
      buildToolInputJsonSchema(
        {
          type: 'record',
          objectUniversalIdentifier: 'company-universal-identifier',
        },
        () => 'Company',
      ),
    ).toEqual({ type: 'string', description: 'Id of the Company record' });
  });

  it('should collapse a records type to an array of id strings', () => {
    expect(
      buildToolInputJsonSchema(
        {
          type: 'records',
          objectUniversalIdentifier: 'person-universal-identifier',
        },
        () => 'Person',
      ),
    ).toEqual({
      type: 'array',
      items: { type: 'string', description: 'Id of the Person record' },
    });
  });

  it('should strip custom keywords recursively while keeping standard ones', () => {
    const result = buildToolInputJsonSchema(
      {
        type: 'object',
        label: 'Params',
        properties: {
          company: {
            type: 'object',
            objectUniversalIdentifier: 'company-universal-identifier',
            description: 'A company',
          },
          people: {
            type: 'array',
            label: 'People',
            items: {
              type: 'object',
              objectUniversalIdentifier: 'person-universal-identifier',
            },
          },
          note: { type: 'string', multiline: true },
          kind: { type: 'string', enum: ['a', 'b'] },
        },
        required: ['company'],
      },
      () => 'Company',
    );

    expect(result).toEqual({
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Id of the Company record' },
        people: {
          type: 'array',
          items: { type: 'string', description: 'Id of the Company record' },
        },
        note: { type: 'string' },
        kind: { type: 'string', enum: ['a', 'b'] },
      },
      required: ['company'],
    });
  });

  it('should keep boolean additionalProperties and sanitize object ones', () => {
    expect(
      buildToolInputJsonSchema({
        type: 'object',
        additionalProperties: false,
      }),
    ).toEqual({ type: 'object', additionalProperties: false });

    expect(
      buildToolInputJsonSchema({
        type: 'object',
        additionalProperties: { type: 'string', multiline: true },
      }),
    ).toEqual({ type: 'object', additionalProperties: { type: 'string' } });
  });

  it('should leave non-record nodes untouched aside from custom keywords', () => {
    expect(
      buildToolInputJsonSchema({
        type: 'object',
        properties: {
          plainObject: { type: 'object' },
          count: { type: 'number', minimum: 0, maximum: 10 },
        },
      }),
    ).toEqual({
      type: 'object',
      properties: {
        plainObject: { type: 'object' },
        count: { type: 'number', minimum: 0, maximum: 10 },
      },
    });
  });
});
