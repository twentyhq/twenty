import { getFunctionInputSchema } from '@/logic-function/get-function-input-schema';

describe('getFunctionInputSchema', () => {
  it('should analyze a simple function correctly', () => {
    const fileContent = `
        function testFunction(param1: string, param2: number): void {
          return;
        }
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([{ type: 'string' }, { type: 'number' }]);
  });

  it('should analyze a arrow function correctly', () => {
    const fileContent = `
        export const main = async (
          param1: string,
          param2: number,
        ): Promise<object> => {
          return param1;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([{ type: 'string' }, { type: 'number' }]);
  });

  it('should parse any[] as an array with unknown items', () => {
    const fileContent = `
        export const main = (params: { briefs: any[] }): void => {
          return;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          briefs: { type: 'array', items: {} },
        },
      },
    ]);
  });

  it('should parse Array<T> generic syntax the same way as T[]', () => {
    const fileContent = `
        export const main = (params: {
          briefs: Array<any>;
          names: Array<string>;
          readonlyNames: ReadonlyArray<string>;
        }): void => {
          return;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          briefs: { type: 'array', items: {} },
          names: { type: 'array', items: { type: 'string' } },
          readonlyNames: { type: 'array', items: { type: 'string' } },
        },
      },
    ]);
  });

  it('should fall back to an unknown type for unrecognized type references', () => {
    const fileContent = `
        export const main = (params: { value: Map<string, number> }): void => {
          return;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          value: {},
        },
      },
    ]);
  });

  it('should resolve TwentyRecord markers to record schemas', () => {
    const fileContent = `
        export const main = (params: {
          company: TwentyRecord<'company-universal-identifier'>;
          companies: TwentyRecord<'company-universal-identifier'>[];
          otherCompanies: Array<TwentyRecord<'company-universal-identifier'>>;
        }): void => {
          return;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            objectUniversalIdentifier: 'company-universal-identifier',
          },
          companies: {
            type: 'array',
            items: {
              type: 'object',
              objectUniversalIdentifier: 'company-universal-identifier',
            },
          },
          otherCompanies: {
            type: 'array',
            items: {
              type: 'object',
              objectUniversalIdentifier: 'company-universal-identifier',
            },
          },
        },
      },
    ]);
  });

  it('should leave a bare TwentyRecord without a literal argument unresolved', () => {
    const fileContent = `
        export const main = (params: { record: TwentyRecord }): void => {
          return;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          record: {},
        },
      },
    ]);
  });

  it('should not resolve plain object type references to records', () => {
    const fileContent = `
        export const main = (params: {
          company: Company;
          companies: Company[];
        }): void => {
          return;
        };
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          company: {},
          companies: { type: 'array', items: {} },
        },
      },
    ]);
  });

  it('should analyze a complex function correctly', () => {
    const fileContent = `
        function testFunction(
          params: {
            param1: string;
            param2: number;
            param3: boolean;
            param4: object;
            param5: { subParam1: string };
            param6: "my" | "enum";
            param7: string[];
          }
        ): void {
          return
        }
      `;
    const result = getFunctionInputSchema(fileContent);

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          param1: { type: 'string' },
          param2: { type: 'number' },
          param3: { type: 'boolean' },
          param4: { type: 'object' },
          param5: {
            type: 'object',
            properties: {
              subParam1: { type: 'string' },
            },
          },
          param6: { type: 'string', enum: ['my', 'enum'] },
          param7: { type: 'array', items: { type: 'string' } },
        },
      },
    ]);
  });
});
