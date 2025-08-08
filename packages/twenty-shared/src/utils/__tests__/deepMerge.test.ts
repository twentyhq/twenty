import { type EachTestingContext } from '@/testing/types/EachTestingContext.type';
import { deepMerge } from '@/utils';

type DeepMergeTestCase<T extends object> = {
  source: Required<T>;
  target: Required<T>;
  expected: T;
};

describe('deepMerge', () => {
  describe('primitive values', () => {
    type PrimitiveValue = { value: string | number | boolean };

    const primitiveTestCases: EachTestingContext<
      DeepMergeTestCase<PrimitiveValue>
    >[] = [
      {
        title: 'should override string values',
        context: {
          source: { value: 'hello' },
          target: { value: 'world' },
          expected: { value: 'world' },
        },
      },
      {
        title: 'should override number values',
        context: {
          source: { value: 42 },
          target: { value: 24 },
          expected: { value: 24 },
        },
      },
      {
        title: 'should override boolean values',
        context: {
          source: { value: true },
          target: { value: false },
          expected: { value: false },
        },
      },
    ];

    it.each(primitiveTestCases)(
      '$title',
      ({ context: { source, target, expected } }) => {
        expect(deepMerge(source, target)).toEqual(expected);
      },
    );
  });

  describe('null and undefined handling', () => {
    type NullableValue = { value: string | null };

    const nullTestCases: EachTestingContext<
      DeepMergeTestCase<NullableValue>
    >[] = [
      {
        title: 'should preserve null values from target',
        context: {
          source: { value: 'hello' },
          target: { value: null },
          expected: { value: null },
        },
      },
      {
        title: 'should ignore undefined values from target',
        context: {
          source: { value: 'hello' },
          target: { value: undefined as unknown as null },
          expected: { value: 'hello' },
        },
      },
      {
        title: 'should override null values from source',
        context: {
          source: { value: null },
          target: { value: 'world' },
          expected: { value: 'world' },
        },
      },
    ];

    it.each(nullTestCases)(
      '$title',
      ({ context: { source, target, expected } }) => {
        expect(deepMerge(source, target)).toEqual(expected);
      },
    );

    type MixedNullValue = { a: number | null; b: number };

    const mixedNullTestCase: EachTestingContext<
      DeepMergeTestCase<MixedNullValue>
    > = {
      title: 'should handle mixed null and undefined values',
      context: {
        source: { a: 1, b: 2 },
        target: { a: null, b: 2 },
        expected: { a: null, b: 2 },
      },
    };

    it(mixedNullTestCase.title, () => {
      const { source, target, expected } = mixedNullTestCase.context;
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });

  describe('array handling', () => {
    type ArrayValue = { arr: Array<string | number> | null };

    const arrayTestCases: EachTestingContext<DeepMergeTestCase<ArrayValue>>[] =
      [
        {
          title: 'should concatenate arrays',
          context: {
            source: { arr: [1, 2] },
            target: { arr: [3, 4] },
            expected: { arr: [1, 2, 3, 4] },
          },
        },
        {
          title: 'should handle empty target array',
          context: {
            source: { arr: [1, 2] },
            target: { arr: [] },
            expected: { arr: [1, 2] },
          },
        },
        {
          title: 'should handle empty source array',
          context: {
            source: { arr: [] },
            target: { arr: [1, 2] },
            expected: { arr: [1, 2] },
          },
        },
        {
          title: 'should handle null target array',
          context: {
            source: { arr: ['a', 'b'] },
            target: { arr: null },
            expected: { arr: null },
          },
        },
      ];

    it.each(arrayTestCases)(
      '$title',
      ({ context: { source, target, expected } }) => {
        expect(deepMerge(source, target)).toEqual(expected);
      },
    );
  });

  describe('nested objects', () => {
    type NestedValue = {
      nested: {
        a: number;
        b: number;
        deep?: {
          a: number;
          b: number;
        };
        arr: Array<number>;
        obj: {
          a: number;
          b: number;
        };
      } | null;
    };

    const nestedTestCases: EachTestingContext<
      DeepMergeTestCase<NestedValue>
    >[] = [
      {
        title: 'should merge nested objects',
        context: {
          source: { nested: { a: 1, b: 2, arr: [], obj: { a: 1, b: 2 } } },
          target: { nested: { a: 1, b: 3, arr: [], obj: { a: 1, b: 2 } } },
          expected: { nested: { a: 1, b: 3, arr: [], obj: { a: 1, b: 2 } } },
        },
      },
      {
        title: 'should merge deeply nested objects',
        context: {
          source: {
            nested: {
              a: 1,
              b: 2,
              deep: { a: 1, b: 2 },
              arr: [],
              obj: { a: 1, b: 2 },
            },
          },
          target: {
            nested: {
              a: 1,
              b: 2,
              deep: { a: 1, b: 3 },
              arr: [],
              obj: { a: 1, b: 2 },
            },
          },
          expected: {
            nested: {
              a: 1,
              b: 2,
              deep: { a: 1, b: 3 },
              arr: [],
              obj: { a: 1, b: 2 },
            },
          },
        },
      },
      {
        title: 'should handle null nested object in target',
        context: {
          source: { nested: { a: 1, b: 2, arr: [], obj: { a: 1, b: 2 } } },
          target: { nested: null },
          expected: { nested: null },
        },
      },
      {
        title: 'should handle complex nested structures',
        context: {
          source: {
            nested: {
              a: 1,
              b: 2,
              arr: [1, 2],
              obj: { a: 1, b: 2 },
            },
          },
          target: {
            nested: {
              a: 1,
              b: 2,
              arr: [3, 4],
              obj: { a: 1, b: 3 },
            },
          },
          expected: {
            nested: {
              a: 1,
              b: 2,
              arr: [1, 2, 3, 4],
              obj: { a: 1, b: 3 },
            },
          },
        },
      },
    ];

    it.each(nestedTestCases)(
      '$title',
      ({ context: { source, target, expected } }) => {
        expect(deepMerge(source, target)).toEqual(expected);
      },
    );
  });

  describe('edge cases', () => {
    type EdgeValue = {
      a: number | Date | RegExp;
      b: number | Date | RegExp;
    };

    const edgeTestCases: EachTestingContext<DeepMergeTestCase<EdgeValue>>[] = [
      {
        title: 'should handle Date objects by replacing them',
        context: {
          source: { a: new Date('2023-01-01'), b: new Date('2023-01-01') },
          target: { a: new Date('2023-12-31'), b: new Date('2023-12-31') },
          expected: { a: new Date('2023-12-31'), b: new Date('2023-12-31') },
        },
      },
      {
        title: 'should handle RegExp objects by replacing them',
        context: {
          source: { a: /test1/, b: /test1/ },
          target: { a: /test2/, b: /test2/ },
          expected: { a: /test2/, b: /test2/ },
        },
      },
      {
        title: 'should handle mixed Date and RegExp objects',
        context: {
          source: { a: new Date('2023-01-01'), b: /test1/ },
          target: { a: new Date('2023-12-31'), b: /test2/ },
          expected: { a: new Date('2023-12-31'), b: /test2/ },
        },
      },
    ];

    it.each(edgeTestCases)(
      '$title',
      ({ context: { source, target, expected } }) => {
        expect(deepMerge(source, target)).toEqual(expected);
      },
    );

    type NestedDateValue = {
      a: { value: Date };
      b: { value: Date };
    };

    const nestedDateTestCase: EachTestingContext<
      DeepMergeTestCase<NestedDateValue>
    > = {
      title: 'should handle Date objects in nested structures',
      context: {
        source: {
          a: { value: new Date('2023-01-01') },
          b: { value: new Date('2023-01-01') },
        },
        target: {
          a: { value: new Date('2023-12-31') },
          b: { value: new Date('2023-12-31') },
        },
        expected: {
          a: { value: new Date('2023-12-31') },
          b: { value: new Date('2023-12-31') },
        },
      },
    };

    it(nestedDateTestCase.title, () => {
      const { source, target, expected } = nestedDateTestCase.context;
      expect(deepMerge(source, target)).toEqual(expected);
    });
  });
});
