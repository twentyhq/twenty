import { getInputSchemaFromSourceCode } from '@/logic-function/get-input-schema-from-source-code';
import { DEFAULT_TOOL_INPUT_SCHEMA } from '@/logic-function/constants/DefaultToolInputSchema';

describe('getInputSchemaFromSourceCode', () => {
  it('should return empty input if not parameter', async () => {
    const fileContent = 'function testFunction() { return }';
    const result = await getInputSchemaFromSourceCode(fileContent);
    expect(result).toEqual(DEFAULT_TOOL_INPUT_SCHEMA);
  });
  it('should return first input if multiple parameters', async () => {
    const fileContent =
      'function testFunction(params1: {}, params2: {}) { return }';
    const result = await getInputSchemaFromSourceCode(fileContent);
    expect(result).toEqual(DEFAULT_TOOL_INPUT_SCHEMA);
  });
  it('should return empty input if wrong parameter', async () => {
    const fileContent = 'function testFunction(params: string) { return }';
    const result = await getInputSchemaFromSourceCode(fileContent);
    expect(result).toEqual(DEFAULT_TOOL_INPUT_SCHEMA);
  });
  it('should return input from source code', async () => {
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

    const result = await getInputSchemaFromSourceCode(fileContent);
    expect(result).toEqual({
      properties: {
        param1: {
          type: 'string',
        },
        param2: {
          type: 'number',
        },
        param3: {
          type: 'boolean',
        },
        param4: {
          type: 'object',
        },
        param5: {
          properties: {
            subParam1: {
              type: 'string',
            },
          },
          type: 'object',
        },
        param6: {
          enum: ['my', 'enum'],
          type: 'string',
        },
        param7: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
      },
      type: 'object',
    });
  });
});
