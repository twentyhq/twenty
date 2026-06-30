import { type Leaf, type Node } from 'twenty-shared/workflow';

import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import { inferArrayItemSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/infer-array-item-schema';

describe('inferArrayItemSchema', () => {
  it('should return DEFAULT_ITERATOR_CURRENT_ITEM for non-leaf node', () => {
    const schemaNode: Node = {
      isLeaf: false,
      type: 'object',
      label: 'test',
      value: {},
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });

  it('should return DEFAULT_ITERATOR_CURRENT_ITEM for non-array leaf', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'string',
      label: 'test',
      value: 'not an array',
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });

  it('should return DEFAULT_ITERATOR_CURRENT_ITEM for empty array', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });

  it('should infer schema for array of strings', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: ['item1', 'item2', 'item3'],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual({
      isLeaf: true,
      type: 'string',
      label: 'Current Item',
      value: 'item1',
    });
  });

  it('should infer schema for array of numbers', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [1, 2, 3],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual({
      isLeaf: true,
      type: 'number',
      label: 'Current Item',
      value: 1,
    });
  });

  it('should infer schema for array of booleans', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [true, false],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual({
      isLeaf: true,
      type: 'boolean',
      label: 'Current Item',
      value: true,
    });
  });

  it('should infer full schema for array of simple objects', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual({
      isLeaf: false,
      type: 'object',
      label: 'Current Item',
      value: {
        id: {
          isLeaf: true,
          type: 'number',
          label: 'id',
          value: 1,
        },
        name: {
          isLeaf: true,
          type: 'string',
          label: 'name',
          value: 'Item 1',
        },
      },
    });
  });

  it('should infer full schema for array of nested objects', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [
        {
          toto: {
            titi: 1,
            tata: 'hello',
          },
        },
        {
          toto: {
            titi: 2,
            tata: 'world',
          },
        },
      ],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual({
      isLeaf: false,
      type: 'object',
      label: 'Current Item',
      value: {
        toto: {
          isLeaf: false,
          type: 'object',
          label: 'toto',
          value: {
            titi: {
              isLeaf: true,
              type: 'number',
              label: 'titi',
              value: 1,
            },
            tata: {
              isLeaf: true,
              type: 'string',
              label: 'tata',
              value: 'hello',
            },
          },
        },
      },
    });
  });

  it('should handle array with null first item', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [null, 'item2'],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });

  it('should handle array with undefined first item', () => {
    const schemaNode: Leaf = {
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [undefined, 'item2'],
    };

    const result = inferArrayItemSchema({ schemaNode });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });
});
