import { Test, TestingModule } from '@nestjs/testing';

import { CodeIntrospectionService2 } from 'src/modules/code-introspection/code-introspection-2.service';

describe('CodeIntrospectionService2', () => {
  let service: CodeIntrospectionService2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeIntrospectionService2],
    }).compile();

    service = module.get<CodeIntrospectionService2>(CodeIntrospectionService2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFunctionInputSchema', () => {
    it('should analyze a function declaration correctly', () => {
      const fileContent = `
        function testFunction(param1: string, param2: number): void {
          return
        }
      `;

      const result = service.getFunctionInputSchema(fileContent);

      expect(result).toEqual({
        param1: { type: 'string' },
        param2: { type: 'number' },
      });
    });

    it('should analyze object parameters', () => {
      const fileContent = `
        function testFunction(
          params: {
            param1: string;
            param2: number;
            param3: boolean;
            param4: object;
            param5: { subParam1: string };
            param6: "my" | "enum",
            param7: string[],
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
});
