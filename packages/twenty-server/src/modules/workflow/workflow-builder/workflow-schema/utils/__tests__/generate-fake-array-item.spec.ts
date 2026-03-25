import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import { generateFakeArrayItem } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-array-item';

describe('generateFakeArrayItem', () => {
  it('should return default iterator when input cannot be parsed', () => {
    const result = generateFakeArrayItem({ items: 'invalid json' });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });

  it('should handle string array input', () => {
    const result = generateFakeArrayItem({ items: '["test1", "test2"]' });

    expect(result).toEqual({
      label: 'Current Item',
      isLeaf: true,
      type: 'string',
      value: expect.any(String),
    });
  });

  it('should handle regular array input', () => {
    const result = generateFakeArrayItem({ items: [1, 2, 3] });

    expect(result).toEqual({
      label: 'Current Item',
      isLeaf: true,
      type: 'number',
      value: expect.any(Number),
    });
  });

  it('should return default iterator when input is parsed but not an array', () => {
    const result = generateFakeArrayItem({ items: '{"key": "value"}' });

    expect(result).toEqual(DEFAULT_ITERATOR_CURRENT_ITEM);
  });
});
