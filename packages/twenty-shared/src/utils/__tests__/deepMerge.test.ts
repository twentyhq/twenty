import { deepMerge } from "@/utils";

// TODO Refactor too much auto generated
describe('deepMerge', () => {
  describe('primitive values', () => {
    it.each<{
      source: { value: string | number | boolean };
      target: { value: string | number | boolean };
      expected: { value: string | number | boolean };
      description: string;
    }>([
      {
        source: { value: 'hello' },
        target: { value: 'world' },
        expected: { value: 'world' },
        description: 'should override string values',
      },
      {
        source: { value: 42 },
        target: { value: 24 },
        expected: { value: 24 },
        description: 'should override number values',
      },
      {
        source: { value: true },
        target: { value: false },
        expected: { value: false },
        description: 'should override boolean values',
      },
    ])('$description', ({ source, target, expected }) => {
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });

  describe('null and undefined handling', () => {
    it.each<{
      source: { value: string | null };
      target: { value: string | null | undefined };
      expected: { value?: string | null };
      description: string;
    }>([
      {
        source: { value: 'hello' },
        target: { value: null },
        expected: { value: null },
        description: 'should preserve null values from target',
      },
      {
        source: { value: 'hello' },
        target: { value: undefined },
        expected: { value: 'hello' },
        description: 'should ignore undefined values from target',
      },
      {
        source: { value: null },
        target: { value: 'world' },
        expected: { value: 'world' },
        description: 'should override null values from source',
      },
    ])('$description', ({ source, target, expected }) => {
      expect(deepMerge(source, target)).toEqual(expected);
    });

    it('should handle mixed null and undefined values', () => {
      type TestObj = { a: number | null; b: number };
      const source: TestObj = { a: 1, b: 2 };
      const target: Partial<TestObj> = { a: null, b: undefined };
      const expected: TestObj = { a: null, b: 2 };
      expect(deepMerge(source, target)).toEqual(expected);
    });

    it.each([
      {
        source: null,
        target: { value: 'world' },
        expected: { value: 'world' },
        description: 'should handle null source',
      },
      {
        source: { value: 'hello' },
        target: null,
        expected: { value: 'hello' },
        description: 'should handle null target',
      },
    ])('$description', ({ source, target, expected }) => {
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });

  describe('array handling', () => {
    it.each<{
      source: { arr: Array<number | string> | null };
      target: { arr: Array<number | string> | null };
      expected: { arr: Array<number | string> | null };
      description: string;
    }>([
      {
        source: { arr: [1, 2] },
        target: { arr: [3, 4] },
        expected: { arr: [1, 2, 3, 4] },
        description: 'should concatenate arrays',
      },
      {
        source: { arr: [1, 2] },
        target: { arr: [] },
        expected: { arr: [1, 2] },
        description: 'should handle empty target array',
      },
      {
        source: { arr: [] },
        target: { arr: [1, 2] },
        expected: { arr: [1, 2] },
        description: 'should handle empty source array',
      },
      {
        source: { arr: ['a', 'b'] },
        target: { arr: null },
        expected: { arr: null },
        description: 'should handle null target array',
      },
    ])('$description', ({ source, target, expected }) => {
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });

  describe('nested objects', () => {
    it('should merge nested objects', () => {
      type NestedObj = {
        nested: {
          a?: number;
          b?: number;
          c?: number;
        };
      };
      const source: NestedObj = { nested: { a: 1, b: 2 } };
      const target: Partial<NestedObj> = { nested: { b: 3, c: 4 } };
      const expected: NestedObj = { nested: { a: 1, b: 3, c: 4 } };
      expect(deepMerge(source, target)).toEqual(expected);
    });

    it('should merge deeply nested objects', () => {
      type DeepObj = {
        nested: {
          deep: {
            a?: number;
            b?: number;
          };
        };
      };
      const source: DeepObj = { nested: { deep: { a: 1 } } };
      const target: Partial<DeepObj> = { nested: { deep: { b: 2 } } };
      const expected: DeepObj = { nested: { deep: { a: 1, b: 2 } } };
      expect(deepMerge(source, target)).toEqual(expected);
    });

    it('should handle null nested object in target', () => {
      type NullableObj = {
        nested: { a: number } | null;
      };
      const source: NullableObj = { nested: { a: 1 } };
      const target: Partial<NullableObj> = { nested: null };
      const expected: NullableObj = { nested: null };
      expect(deepMerge(source, target)).toEqual(expected);
    });

    it('should handle complex nested structures', () => {
      type ComplexObj = {
        nested: {
          arr: number[];
          obj: {
            a?: number;
            b?: number;
          };
        };
      };
      const source: ComplexObj = {
        nested: {
          arr: [1, 2],
          obj: { a: 1 },
        },
      };
      const target: Partial<ComplexObj> = {
        nested: {
          arr: [3, 4],
          obj: { b: 2 },
        },
      };
      const expected: ComplexObj = {
        nested: {
          arr: [1, 2, 3, 4],
          obj: { a: 1, b: 2 },
        },
      };
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it.each<{
      source: Record<string, any>;
      target: Record<string, any>;
      expected: Record<string, any>;
      description: string;
    }>([
      {
        source: {},
        target: { a: 1 },
        expected: { a: 1 },
        description: 'should handle empty source object',
      },
      {
        source: { a: 1 },
        target: {},
        expected: { a: 1 },
        description: 'should handle empty target object',
      },
      {
        source: { a: new Date('2023-01-01') },
        target: { b: new Date('2023-12-31') },
        expected: { a: new Date('2023-01-01'), b: new Date('2023-12-31') },
        description: 'should handle Date objects',
      },
      {
        source: { a: /test/ },
        target: { b: /test2/ },
        expected: { a: /test/, b: /test2/ },
        description: 'should handle RegExp objects',
      },
    ])('$description', ({ source, target, expected }) => {
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });
}); 