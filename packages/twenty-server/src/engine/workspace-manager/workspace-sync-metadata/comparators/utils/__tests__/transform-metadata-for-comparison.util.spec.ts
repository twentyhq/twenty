import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util'; // Adjust the import path as necessary

describe('transformMetadataForComparison', () => {
  // Test for a single object
  it('transforms a single object correctly with nested objects', () => {
    const input = { name: 'Test', details: { a: 1, nested: { b: 2 } } };
    const result = transformMetadataForComparison(input, {
      propertiesToStringify: ['details'],
    });

    expect(result).toEqual({
      name: 'Test',
      details: '{"a":1,"nested":{"b":2}}',
    });
  });

  // Test for an array of objects
  it('transforms an array of objects correctly, ignoring and stringifying multiple properties', () => {
    const input = [
      { name: 'Test1', value: { a: 1 }, ignored: 'ignoreMe' },
      { name: 'Test2', value: { c: 3 }, extra: 'keepMe' },
    ];
    const result = transformMetadataForComparison(input, {
      shouldIgnoreProperty: (property) => ['ignored'].includes(property),
      propertiesToStringify: ['value'],
      keyFactory: (datum) => datum.name,
    });

    expect(result).toEqual({
      Test1: { name: 'Test1', value: '{"a":1}' },
      Test2: { name: 'Test2', value: '{"c":3}', extra: 'keepMe' },
    });
  });

  // Test with a custom keyFactory function
  it('uses a custom keyFactory function to generate keys', () => {
    const input = [{ id: 123, name: 'Test' }];
    const result = transformMetadataForComparison(input, {
      keyFactory: (datum) => `key-${datum.id}`,
    });

    expect(result).toHaveProperty('key-123');
    expect((result as Record<string, any>)['key-123']).toEqual({
      id: 123,
      name: 'Test',
    });
  });

  // Test with an empty array
  it('handles an empty array gracefully', () => {
    const result = transformMetadataForComparison([], {});

    expect(result).toEqual({});
  });

  // Test with an empty object
  it('handles an empty object gracefully', () => {
    const result = transformMetadataForComparison({}, {});

    expect(result).toEqual({});
  });
});
