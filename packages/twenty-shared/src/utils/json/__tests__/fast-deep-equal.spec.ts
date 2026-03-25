import { fastDeepEqual } from '../fast-deep-equal';

describe('fastDeepEqual', () => {
  describe('primitives', () => {
    it('should return true for identical primitives', () => {
      expect(fastDeepEqual(1, 1)).toBe(true);
      expect(fastDeepEqual('hello', 'hello')).toBe(true);
      expect(fastDeepEqual(true, true)).toBe(true);
      expect(fastDeepEqual(null, null)).toBe(true);
      expect(fastDeepEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(fastDeepEqual(1, 2)).toBe(false);
      expect(fastDeepEqual('hello', 'world')).toBe(false);
      expect(fastDeepEqual(true, false)).toBe(false);
      expect(fastDeepEqual(null, undefined)).toBe(false);
    });

    it('should return true for both NaN', () => {
      expect(fastDeepEqual(NaN, NaN)).toBe(true);
    });

    it('should return false for NaN vs number', () => {
      expect(fastDeepEqual(NaN, 1)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should return true for identical arrays', () => {
      expect(fastDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(fastDeepEqual([], [])).toBe(true);
    });

    it('should return false for different array lengths', () => {
      expect(fastDeepEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('should return false for different array values', () => {
      expect(fastDeepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should handle nested arrays', () => {
      expect(
        fastDeepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(
        fastDeepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
    });

    it('should return false when comparing array to non-array', () => {
      expect(fastDeepEqual([1, 2, 3], { 0: 1, 1: 2, 2: 3 })).toBe(false);
    });
  });

  describe('objects', () => {
    it('should return true for identical objects', () => {
      expect(fastDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(fastDeepEqual({}, {})).toBe(true);
    });

    it('should return false for different object keys', () => {
      expect(fastDeepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('should return false for different object values', () => {
      expect(fastDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should return false for different number of keys', () => {
      expect(fastDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('should handle nested objects', () => {
      const obj1 = { level1: { level2: { key: 'value' } } };
      const obj2 = { level1: { level2: { key: 'value' } } };
      const obj3 = { level1: { level2: { key: 'different' } } };

      expect(fastDeepEqual(obj1, obj2)).toBe(true);
      expect(fastDeepEqual(obj1, obj3)).toBe(false);
    });

    it('should return true for same reference', () => {
      const obj = { a: 1 };

      expect(fastDeepEqual(obj, obj)).toBe(true);
    });
  });

  describe('Map', () => {
    it('should return true for identical maps', () => {
      const map1 = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      const map2 = new Map([
        ['a', 1],
        ['b', 2],
      ]);

      expect(fastDeepEqual(map1, map2)).toBe(true);
    });

    it('should return false for different map sizes', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([
        ['a', 1],
        ['b', 2],
      ]);

      expect(fastDeepEqual(map1, map2)).toBe(false);
    });

    it('should return false for different map keys', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([['b', 1]]);

      expect(fastDeepEqual(map1, map2)).toBe(false);
    });

    it('should return false for different map values', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([['a', 2]]);

      expect(fastDeepEqual(map1, map2)).toBe(false);
    });

    it('should handle nested values in maps', () => {
      const map1 = new Map([['obj', { nested: 'value' }]]);
      const map2 = new Map([['obj', { nested: 'value' }]]);
      const map3 = new Map([['obj', { nested: 'different' }]]);

      expect(fastDeepEqual(map1, map2)).toBe(true);
      expect(fastDeepEqual(map1, map3)).toBe(false);
    });
  });

  describe('Set', () => {
    it('should return true for identical sets', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 3]);

      expect(fastDeepEqual(set1, set2)).toBe(true);
    });

    it('should return false for different set sizes', () => {
      const set1 = new Set([1, 2]);
      const set2 = new Set([1, 2, 3]);

      expect(fastDeepEqual(set1, set2)).toBe(false);
    });

    it('should return false for different set values', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 4]);

      expect(fastDeepEqual(set1, set2)).toBe(false);
    });
  });

  describe('TypedArrays', () => {
    it('should return true for identical typed arrays', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2, 3]);

      expect(fastDeepEqual(arr1, arr2)).toBe(true);
    });

    it('should return false for different typed array lengths', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2]);

      expect(fastDeepEqual(arr1, arr2)).toBe(false);
    });

    it('should return false for different typed array values', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2, 4]);

      expect(fastDeepEqual(arr1, arr2)).toBe(false);
    });
  });

  describe('RegExp', () => {
    it('should return true for identical regexes', () => {
      expect(fastDeepEqual(/abc/gi, /abc/gi)).toBe(true);
    });

    it('should return false for different regex sources', () => {
      expect(fastDeepEqual(/abc/, /def/)).toBe(false);
    });

    it('should return false for different regex flags', () => {
      expect(fastDeepEqual(/abc/i, /abc/g)).toBe(false);
    });
  });

  describe('Date', () => {
    it('should return true for identical dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');

      expect(fastDeepEqual(date1, date2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      expect(fastDeepEqual(date1, date2)).toBe(false);
    });
  });

  describe('constructor mismatch', () => {
    it('should return false for different constructors', () => {
      class Custom {
        value: number;
        constructor(value: number) {
          this.value = value;
        }
      }

      const custom = new Custom(1);
      const plain = { value: 1 };

      expect(fastDeepEqual(custom, plain)).toBe(false);
    });
  });

  describe('mixed types', () => {
    it('should return false for object vs null', () => {
      expect(fastDeepEqual({ a: 1 }, null)).toBe(false);
    });

    it('should return false for array vs object', () => {
      expect(fastDeepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });

    it('should return false for number vs string', () => {
      expect(fastDeepEqual(1, '1')).toBe(false);
    });
  });

  describe('large nested structures', () => {
    it('should handle workflow-like structures', () => {
      const workflowState1 = {
        flow: {
          trigger: {
            name: 'trigger',
            type: 'DATABASE_EVENT',
            settings: { eventName: 'company.created', outputSchema: {} },
          },
          steps: Array.from({ length: 100 }, (_, index) => ({
            id: `step-${index}`,
            name: `Step ${index}`,
            type: 'CODE',
            settings: { code: `console.log(${index})` },
            valid: true,
          })),
        },
        stepInfos: {
          trigger: { status: 'SUCCESS', result: {} },
        },
      };

      const workflowState2 = {
        ...workflowState1,
        stepInfos: {
          ...workflowState1.stepInfos,
          'step-0': { status: 'SUCCESS', result: { value: 42 } },
        },
      };

      expect(fastDeepEqual(workflowState1, workflowState1)).toBe(true);
      expect(fastDeepEqual(workflowState1, workflowState2)).toBe(false);
    });
  });
});
