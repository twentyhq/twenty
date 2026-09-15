import { type InputJsonSchema } from '@/logic-function';
import { getFunctionInputFromInputSchema, type InputSchema } from '@/workflow';

describe('getDefaultFunctionInputFromInputSchema', () => {
  it('should init function input properly', () => {
    const inputSchema = [
      {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
          b: {
            type: 'number',
          },
          c: {
            type: 'array',
            items: { type: 'string' },
          },
          d: {
            type: 'object',
            properties: {
              da: { type: 'string', enum: ['my', 'enum'] },
              db: { type: 'number' },
            },
          },
          e: { type: 'object' },
        },
      },
    ] as InputSchema;
    const expectedResult = [
      {
        a: null,
        b: null,
        c: [],
        d: { da: 'my', db: null },
        e: {},
      },
    ];
    expect(getFunctionInputFromInputSchema(inputSchema)).toEqual(
      expectedResult,
    );
  });

  it('should init arrays with unknown items (e.g. any[]) as empty arrays', () => {
    const inputSchema: InputJsonSchema[] = [
      {
        type: 'object',
        properties: {
          briefs: { type: 'array', items: {} },
        },
      },
    ];

    expect(getFunctionInputFromInputSchema(inputSchema)).toEqual([
      { briefs: [] },
    ]);
  });

  it('should init record-typed inputs with null and record arrays with empty arrays', () => {
    const inputSchema = [
      {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            objectUniversalIdentifier: 'company-universal-identifier',
          },
          people: {
            type: 'array',
            items: {
              type: 'object',
              objectUniversalIdentifier: 'person-universal-identifier',
            },
          },
          plainObject: { type: 'object' },
        },
      },
    ] as InputSchema;

    expect(getFunctionInputFromInputSchema(inputSchema)).toEqual([
      {
        company: null,
        people: [],
        plainObject: {},
      },
    ]);
  });

  it('should init record/records types with null and empty array', () => {
    const inputSchema = [
      {
        type: 'object',
        properties: {
          company: {
            type: 'record',
            objectUniversalIdentifier: 'company-universal-identifier',
          },
          people: {
            type: 'records',
            objectUniversalIdentifier: 'person-universal-identifier',
          },
        },
      },
    ] as InputSchema;

    expect(getFunctionInputFromInputSchema(inputSchema)).toEqual([
      { company: null, people: [] },
    ]);
  });
});
