import { type Difference } from 'microdiff';

import { applyDiff } from '@/utils/applyDiff';

describe('applyDiff', () => {
  describe('input validation', () => {
    it('should throw error for non-array diffs', () => {
      const obj = { test: 'value' };

      expect(() => applyDiff(obj, null as any)).toThrow(
        'Diffs must be an array',
      );
      expect(() => applyDiff(obj, 'invalid' as any)).toThrow(
        'Diffs must be an array',
      );
    });

    it('should handle empty diffs array', () => {
      const obj = { test: 'value' };
      const result = applyDiff(obj, []);

      expect(result).toEqual({ test: 'value' });
      expect(result).not.toBe(obj); // Should return a copy
    });

    it('should skip invalid diffs', () => {
      const obj = { test: 'value' };
      const diffs: Difference[] = [
        null as any,
        { type: 'CREATE', path: [], value: 'test' } as any,
        { type: 'CREATE', path: ['test'], value: 'updated' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({ test: 'updated' });
    });
  });

  describe('CREATE operations', () => {
    it('should create new properties in objects', () => {
      const obj = { existing: 'value' };
      const diffs: Difference[] = [
        { type: 'CREATE', path: ['newProp'], value: 'newValue' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        existing: 'value',
        newProp: 'newValue',
      });
    });

    it('should create nested properties', () => {
      const obj = { level1: { existing: 'value' } };
      const diffs: Difference[] = [
        { type: 'CREATE', path: ['level1', 'newProp'], value: 'newValue' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        level1: {
          existing: 'value',
          newProp: 'newValue',
        },
      });
    });

    it('should create array elements', () => {
      const obj = ['existing'];
      const diffs: Difference[] = [
        { type: 'CREATE', path: [1], value: 'newElement' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual(['existing', 'newElement']);
    });

    it('should create deeply nested structures with existing intermediate objects', () => {
      const obj = { level1: { level2: {} } };
      const diffs: Difference[] = [
        { type: 'CREATE', path: ['level1', 'level2', 'prop'], value: 'deep' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        level1: {
          level2: {
            prop: 'deep',
          },
        },
      });
    });

    it('should build deeply nested structures with multiple CREATE operations', () => {
      const obj = {};
      const diffs: Difference[] = [
        { type: 'CREATE', path: ['level1'], value: {} },
        { type: 'CREATE', path: ['level1', 'level2'], value: {} },
        { type: 'CREATE', path: ['level1', 'level2', 'prop'], value: 'deep' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        level1: {
          level2: {
            prop: 'deep',
          },
        },
      });
    });
  });

  describe('CHANGE operations', () => {
    it('should change existing properties', () => {
      const obj = { prop: 'oldValue' };
      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['prop'],
          oldValue: 'oldValue',
          value: 'newValue',
        },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({ prop: 'newValue' });
    });

    it('should change nested properties', () => {
      const obj = { level1: { prop: 'oldValue' } };
      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['level1', 'prop'],
          oldValue: 'oldValue',
          value: 'newValue',
        },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        level1: { prop: 'newValue' },
      });
    });

    it('should change array elements', () => {
      const obj = ['old', 'values'];
      const diffs: Difference[] = [
        { type: 'CHANGE', path: [0], oldValue: 'old', value: 'new' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual(['new', 'values']);
    });

    it('should change complex nested structures', () => {
      const obj = {
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
      };
      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['users', 0, 'name'],
          oldValue: 'John',
          value: 'Johnny',
        },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        users: [
          { id: 1, name: 'Johnny' },
          { id: 2, name: 'Jane' },
        ],
      });
    });
  });

  describe('REMOVE operations', () => {
    it('should remove properties from objects', () => {
      const obj = { keep: 'value', remove: 'toDelete' };
      const diffs: Difference[] = [
        { type: 'REMOVE', path: ['remove'], oldValue: 'toDelete' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({ keep: 'value' });
    });

    it('should remove nested properties', () => {
      const obj = {
        level1: {
          keep: 'value',
          remove: 'toDelete',
        },
      };
      const diffs: Difference[] = [
        { type: 'REMOVE', path: ['level1', 'remove'], oldValue: 'toDelete' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        level1: { keep: 'value' },
      });
    });

    it('should remove single array element', () => {
      const obj = ['keep1', 'remove', 'keep2'];
      const diffs: Difference[] = [
        { type: 'REMOVE', path: [1], oldValue: 'remove' },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual(['keep1', 'keep2']);
    });

    it('should remove multiple array elements in correct order', () => {
      const obj = ['a', 'b', 'c', 'd', 'e'];
      const diffs: Difference[] = [
        { type: 'REMOVE', path: [1], oldValue: 'b' }, // Remove 'b'
        { type: 'REMOVE', path: [3], oldValue: 'd' }, // Remove 'd'
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual(['a', 'c', 'e']);
    });

    it('should handle complex array removal scenarios', () => {
      const obj = ['a', 'b', 'c', 'd', 'e', 'f'];
      const diffs: Difference[] = [
        { type: 'REMOVE', path: [0], oldValue: 'a' }, // Remove 'a'
        { type: 'REMOVE', path: [2], oldValue: 'c' }, // Remove 'c'
        { type: 'REMOVE', path: [4], oldValue: 'e' }, // Remove 'e'
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual(['b', 'd', 'f']);
    });

    it('should remove from nested arrays', () => {
      const obj = {
        items: [
          { id: 1, tags: ['tag1', 'tag2', 'tag3'] },
          { id: 2, tags: ['tag4', 'tag5'] },
        ],
      };
      const diffs: Difference[] = [
        { type: 'REMOVE', path: ['items', 0, 'tags', 1], oldValue: 'tag2' }, // Remove 'tag2'
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        items: [
          { id: 1, tags: ['tag1', 'tag3'] },
          { id: 2, tags: ['tag4', 'tag5'] },
        ],
      });
    });

    it('should throw error for non-numeric array index', () => {
      const obj = ['a', 'b', 'c'];
      const diffs: Difference[] = [
        { type: 'REMOVE', path: ['invalid'], oldValue: 'invalid' },
      ];

      expect(() => applyDiff(obj, diffs)).toThrow(
        'Expected numeric index for array removal, got string',
      );
    });
  });

  describe('mixed operations', () => {
    it('should apply multiple different operations', () => {
      const obj = {
        keep: 'value',
        change: 'oldValue',
        remove: 'toDelete',
        nested: {
          array: ['a', 'b', 'c'],
        },
      };

      const diffs: Difference[] = [
        { type: 'CREATE', path: ['newProp'], value: 'newValue' },
        {
          type: 'CHANGE',
          path: ['change'],
          oldValue: 'oldValue',
          value: 'newValue',
        },
        { type: 'REMOVE', path: ['remove'], oldValue: 'toDelete' },
        { type: 'REMOVE', path: ['nested', 'array', 1], oldValue: 'b' }, // Remove 'b'
        { type: 'CREATE', path: ['nested', 'newArray'], value: [1, 2, 3] },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        keep: 'value',
        change: 'newValue',
        newProp: 'newValue',
        nested: {
          array: ['a', 'c'],
          newArray: [1, 2, 3],
        },
      });
    });

    it('should handle operations on the same array', () => {
      const obj = ['a', 'b', 'c', 'd'];
      const diffs: Difference[] = [
        { type: 'CHANGE', path: [0], oldValue: 'a', value: 'A' }, // Change 'a' to 'A'
        { type: 'REMOVE', path: [1], oldValue: 'b' }, // Remove 'b'
        { type: 'REMOVE', path: [3], oldValue: 'd' }, // Remove 'd'
        { type: 'REMOVE', path: [3], oldValue: 'd' }, // Remove 'd'
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual(['A', 'c']);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid diff type', () => {
      const obj = { test: 'value' };
      const diffs: Difference[] = [
        { type: 'INVALID' as any, path: ['test'], value: 'newValue' },
      ];

      expect(() => applyDiff(obj, diffs)).toThrow(
        'Unsupported diff type: INVALID',
      );
    });

    it('should throw error with path information for invalid operations', () => {
      const obj = { test: 'value' };
      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['nonExistent', 'deep', 'path'],
          oldValue: 'value',
          value: 'value',
        },
      ];

      expect(() => applyDiff(obj, diffs)).toThrow(
        'Failed to apply diff at path nonExistent.deep.path',
      );
    });
  });

  describe('FORBIDDEN_OBJECT_KEYS protection', () => {
    it('should throw error when trying to CREATE forbidden property keys', () => {
      const obj = { safe: 'value' };

      const diffs: Difference[] = [
        { type: 'CREATE', path: ['__proto__'], value: 'malicious' },
      ];

      expect(() => applyDiff(obj, diffs)).toThrow(
        "Refusing to set forbidden property key '__proto__' on object (prototype pollution protection)",
      );
    });

    it('should prevent Unicode escape bypasses of forbidden property keys', () => {
      const obj = { safe: 'value' };

      const unicodeBypassAttempts = [
        // __proto__ with Unicode escapes
        '__\u0070roto__', // \u0070 = 'p'
        '__\u{70}roto__', // ES6 syntax
        '__pr\u006fto__', // \u006f = 'o'
        '__proto\u005f\u005f', // \u005f = '_'

        // constructor with Unicode escapes
        'construc\u0074or', // \u0074 = 't'
        'constr\u0075ctor', // \u0075 = 'u'
        '\u0063onstructor', // \u0063 = 'c'

        // prototype with Unicode escapes
        'proto\u0074ype', // \u0074 = 't'
        'prototy\u0070e', // \u0070 = 'p'
        '\u0070rototype', // \u0070 = 'p'
      ];

      unicodeBypassAttempts.forEach((maliciousKey) => {
        const diffs: Difference[] = [
          { type: 'CREATE', path: [maliciousKey], value: 'malicious' },
        ];

        expect(() => applyDiff(obj, diffs)).toThrow(
          new RegExp(
            `Refusing to set forbidden property key.*prototype pollution protection`,
          ),
        );
      });
    });

    it('should throw error when trying to CHANGE forbidden property keys', () => {
      const obj = { safe: 'value' };

      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['constructor'],
          oldValue: 'old',
          value: 'malicious',
        },
      ];

      expect(() => applyDiff(obj, diffs)).toThrow(
        "Refusing to set forbidden property key 'constructor' on object (prototype pollution protection)",
      );
    });

    it('should silently skip removal of forbidden property keys', () => {
      const obj = {
        safe: 'value',
        normalProp: 'normal',
      };

      const diffs: Difference[] = [
        // Try to remove forbidden keys (these should be silently skipped)
        { type: 'REMOVE', path: ['__proto__'], oldValue: 'anything' },
        { type: 'REMOVE', path: ['constructor'], oldValue: 'anything' },
        { type: 'REMOVE', path: ['prototype'], oldValue: 'anything' },
        // Remove a normal property (this should work)
        { type: 'REMOVE', path: ['safe'], oldValue: 'value' },
      ];

      const result = applyDiff(obj, diffs);

      // Only the safe property should be removed, normalProp should remain
      expect(result).toEqual({
        normalProp: 'normal',
      });

      // Verify safe property was actually removed
      expect(result).not.toHaveProperty('safe');
    });
  });

  describe('immutability', () => {
    it('should not modify the original object', () => {
      const obj = { prop: 'value', nested: { deep: 'value' } };
      const originalObj = JSON.parse(JSON.stringify(obj));

      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['prop'],
          oldValue: 'value',
          value: 'newValue',
        },
        {
          type: 'CHANGE',
          path: ['nested', 'deep'],
          oldValue: 'value',
          value: 'newDeepValue',
        },
      ];

      applyDiff(obj, diffs);

      expect(obj).toEqual(originalObj);
    });

    it('should not modify the original array', () => {
      const obj = ['a', 'b', 'c'];
      const originalObj = [...obj];

      const diffs: Difference[] = [
        { type: 'REMOVE', path: [1], oldValue: 'b' },
      ];

      applyDiff(obj, diffs);

      expect(obj).toEqual(originalObj);
    });

    it('should handle frozen objects', () => {
      const obj = Object.freeze({ prop: 'value' });
      const diffs: Difference[] = [
        {
          type: 'CHANGE',
          path: ['prop'],
          oldValue: 'value',
          value: 'newValue',
        },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({ prop: 'newValue' });
      expect(obj.prop).toBe('value'); // Original unchanged
    });
  });

  describe('complex scenarios', () => {
    it('should handle workflow-like data structures', () => {
      const obj = {
        trigger: {
          type: 'DATABASE_EVENT',
          settings: { table: 'users' },
        },
        steps: [
          {
            id: '1',
            type: 'CODE',
            settings: { code: 'console.log("hello")' },
          },
          {
            id: '2',
            type: 'EMAIL',
            settings: { to: 'test@example.com' },
          },
        ],
      };

      const diffs: Difference[] = [
        // Update trigger settings
        {
          type: 'CHANGE',
          path: ['trigger', 'settings', 'table'],
          oldValue: 'users',
          value: 'contacts',
        },
        // Remove first step
        { type: 'REMOVE', path: ['steps', 0], oldValue: '1' },
        // Update remaining step
        {
          type: 'CHANGE',
          path: ['steps', 1, 'settings', 'to'],
          oldValue: 'test@example.com',
          value: 'new@example.com',
        },
        // Add new step
        {
          type: 'CREATE',
          path: ['steps', 2],
          value: {
            id: '3',
            type: 'WEBHOOK',
            settings: { url: 'https://api.example.com/webhook' },
          },
        },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        trigger: {
          type: 'DATABASE_EVENT',
          settings: { table: 'contacts' },
        },
        steps: [
          {
            id: '2',
            type: 'EMAIL',
            settings: { to: 'new@example.com' },
          },
          {
            id: '3',
            type: 'WEBHOOK',
            settings: { url: 'https://api.example.com/webhook' },
          },
        ],
      });
    });

    it('should handle array with multiple removals and additions', () => {
      const obj = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
          { id: 4, name: 'Item 4' },
          { id: 5, name: 'Item 5' },
        ],
      };

      const diffs: Difference[] = [
        // Remove items at indices 1 and 3 (Item 2 and Item 4)
        { type: 'REMOVE', path: ['items', 1], oldValue: 'Item 2' },
        { type: 'REMOVE', path: ['items', 3], oldValue: 'Item 4' },
        { type: 'REMOVE', path: ['items', 3], oldValue: 'Item 4' },
        // Update remaining item
        {
          type: 'CHANGE',
          path: ['items', 0, 'name'],
          oldValue: 'Item 1',
          value: 'Updated Item 1',
        },
        // Add new item
        {
          type: 'CREATE',
          path: ['items', 5],
          value: { id: 6, name: 'New Item' },
        },
      ];

      const result = applyDiff(obj, diffs);
      expect(result).toEqual({
        items: [
          { id: 1, name: 'Updated Item 1' },
          { id: 3, name: 'Item 3' },
          { id: 5, name: 'Item 5' },
          { id: 6, name: 'New Item' },
        ],
      });
    });
  });
});
