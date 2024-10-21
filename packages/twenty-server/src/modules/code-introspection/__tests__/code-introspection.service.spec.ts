import { Test, TestingModule } from '@nestjs/testing';

import { CodeIntrospectionException } from 'src/modules/code-introspection/code-introspection.exception';
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

  describe('analyze', () => {
    it('should analyze a function declaration correctly', () => {
      const fileContent = `
        function testFunction(param1: string, param2: number): void {
          console.log(param1, param2);
        }
      `;

      const result = service.analyze(fileContent);

      expect(result).toEqual([
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
      ]);
    });

    it('should analyze an arrow function correctly', () => {
      const fileContent = `
        const testArrowFunction = (param1: string, param2: number): void => {
          console.log(param1, param2);
        };
      `;

      const result = service.analyze(fileContent);

      expect(result).toEqual([
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
      ]);
    });

    it('should return an empty array for files without functions', () => {
      const fileContent = `
        const x = 5;
        console.log(x);
      `;

      const result = service.analyze(fileContent);

      expect(result).toEqual([]);
    });

    it('should throw an exception for multiple function declarations', () => {
      const fileContent = `
        function func1(param1: string) {}
        function func2(param2: number) {}
      `;

      expect(() => service.analyze(fileContent)).toThrow(
        CodeIntrospectionException,
      );
      expect(() => service.analyze(fileContent)).toThrow(
        'Only one function is allowed',
      );
    });

    it('should throw an exception for multiple arrow functions', () => {
      const fileContent = `
        const func1 = (param1: string) => {};
        const func2 = (param2: number) => {};
      `;

      expect(() => service.analyze(fileContent)).toThrow(
        CodeIntrospectionException,
      );
      expect(() => service.analyze(fileContent)).toThrow(
        'Only one arrow function is allowed',
      );
    });

    it('should correctly analyze complex types', () => {
      const fileContent = `
        function complexFunction(param1: string[], param2: { key: number }): Promise<boolean> {
          return Promise.resolve(true);
        }
      `;

      const result = service.analyze(fileContent);

      expect(result).toEqual([
        { name: 'param1', type: 'string[]' },
        { name: 'param2', type: '{ key: number; }' },
      ]);
    });
  });
});
