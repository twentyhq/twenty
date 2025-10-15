import { type BaseOutputSchemaV2 } from '../../types/base-output-schema.type';
import { navigateOutputSchemaProperty } from '../navigateOutputSchemaProperty';

describe('navigateOutputSchemaProperty', () => {
  const testSchema: BaseOutputSchemaV2 = {
    result: {
      isLeaf: false,
      type: 'object',
      label: 'result',
      value: {
        items: {
          isLeaf: true,
          type: 'array',
          label: 'items',
          value: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        },
        metadata: {
          isLeaf: false,
          type: 'object',
          label: 'metadata',
          value: {
            count: {
              isLeaf: true,
              type: 'number',
              label: 'count',
              value: 2,
            },
          },
        },
      },
    },
    name: {
      isLeaf: true,
      type: 'string',
      label: 'name',
      value: 'Test',
    },
  };

  it('should navigate to direct property', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: ['name'],
    });

    expect(result).toEqual({
      isLeaf: true,
      type: 'string',
      label: 'name',
      value: 'Test',
    });
  });

  it('should navigate to nested property', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: ['result', 'items'],
    });

    expect(result).toEqual({
      isLeaf: true,
      type: 'array',
      label: 'items',
      value: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    });
  });

  it('should navigate to deeply nested property', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: ['result', 'metadata', 'count'],
    });

    expect(result).toEqual({
      isLeaf: true,
      type: 'number',
      label: 'count',
      value: 2,
    });
  });

  it('should return undefined for missing property', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: ['nonexistent'],
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for missing nested property', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: ['result', 'nonexistent'],
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for empty property path', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: [],
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when trying to navigate through a leaf', () => {
    const result = navigateOutputSchemaProperty({
      schema: testSchema,
      propertyPath: ['name', 'invalid'],
    });

    expect(result).toBeUndefined();
  });
});
