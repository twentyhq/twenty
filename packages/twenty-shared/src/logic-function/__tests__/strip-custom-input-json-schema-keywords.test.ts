import { stripCustomInputJsonSchemaKeywords } from '@/logic-function/strip-custom-input-json-schema-keywords';

describe('stripCustomInputJsonSchemaKeywords', () => {
  it('should strip custom keywords recursively while keeping standard ones', () => {
    const result = stripCustomInputJsonSchemaKeywords({
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
    });

    expect(result).toEqual({
      type: 'object',
      properties: {
        company: { type: 'object', description: 'A company' },
        people: { type: 'array', items: { type: 'object' } },
        note: { type: 'string' },
        kind: { type: 'string', enum: ['a', 'b'] },
      },
      required: ['company'],
    });
  });

  it('should keep boolean additionalProperties and sanitize object ones', () => {
    expect(
      stripCustomInputJsonSchemaKeywords({
        type: 'object',
        additionalProperties: false,
      }),
    ).toEqual({ type: 'object', additionalProperties: false });

    expect(
      stripCustomInputJsonSchemaKeywords({
        type: 'object',
        additionalProperties: { type: 'string', multiline: true },
      }),
    ).toEqual({ type: 'object', additionalProperties: { type: 'string' } });
  });
});
