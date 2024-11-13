import { Test, TestingModule } from '@nestjs/testing';

import { CodeIntrospectionService } from 'src/modules/code-introspection/code-introspection.service';

describe('CodeIntrospectionService', () => {
  let service: CodeIntrospectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeIntrospectionService],
    }).compile();

    service = module.get<CodeIntrospectionService>(CodeIntrospectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFunctionInputSchema', () => {
    it('should analyze a simple function correctly', () => {
      const fileContent = `
        function testFunction(param1: string, param2: number): void {
          return;
        }
      `;
      const result = service.getFunctionInputSchema(fileContent);

      expect(result).toEqual({
        param1: { type: 'string' },
        param2: { type: 'number' },
      });
    });

    it('should analyze a arrow function correctly', () => {
      const fileContent = `
        export const main = async (
          param1: string,
          param2: number,
        ): Promise<object> => {
          return params;
        };
      `;
      const result = service.getFunctionInputSchema(fileContent);

      expect(result).toEqual({
        param1: { type: 'string' },
        param2: { type: 'number' },
      });
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
      const result = service.getFunctionInputSchema(fileContent);

      expect(result).toEqual({
        params: {
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
      });
    });
  });

  describe('generateInputData', () => {
    it('should generate fake data for simple function', () => {
      const fileContent = `
        function testFunction(param1: string, param2: number): void {
          return;
        }
      `;
      const inputSchema = service.getFunctionInputSchema(fileContent);
      const result = service.generateInputData(inputSchema);

      expect(result).toEqual({ param1: 'generated-string-value', param2: 1 });
    });

    it('should generate fake data for complex function', () => {
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

      const inputSchema = service.getFunctionInputSchema(fileContent);
      const result = service.generateInputData(inputSchema);

      expect(result).toEqual({
        params: {
          param1: 'generated-string-value',
          param2: 1,
          param3: true,
          param4: {},
          param5: { subParam1: 'generated-string-value' },
          param6: 'my',
          param7: ['generated-string-value'],
        },
      });
    });
  });
});
