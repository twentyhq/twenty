import { type BaseOutputSchemaV2 } from '../../types/base-output-schema.type';
import { findOutputSchemaPathFailure } from '../findOutputSchemaPathFailure';

describe('findOutputSchemaPathFailure', () => {
  const testSchema: BaseOutputSchemaV2 = {
    user: {
      isLeaf: false,
      type: 'object',
      label: 'user',
      value: {
        name: {
          isLeaf: true,
          type: 'string',
          label: 'name',
          value: 'Test',
        },
        email: {
          isLeaf: true,
          type: 'string',
          label: 'email',
          value: 'test@test.com',
        },
      },
    },
    id: {
      isLeaf: true,
      type: 'string',
      label: 'id',
      value: '1',
    },
  };

  it('should return undefined when the path resolves fully', () => {
    expect(
      findOutputSchemaPathFailure({
        schema: testSchema,
        propertyPath: ['user', 'name'],
      }),
    ).toBeUndefined();
  });

  it('should report a failing top-level segment with its siblings', () => {
    expect(
      findOutputSchemaPathFailure({
        schema: testSchema,
        propertyPath: ['usr'],
      }),
    ).toEqual({
      validPrefix: [],
      failedSegment: 'usr',
      availableKeys: ['user', 'id'],
    });
  });

  it('should report a failing nested segment with sibling keys at that level', () => {
    expect(
      findOutputSchemaPathFailure({
        schema: testSchema,
        propertyPath: ['user', 'naem'],
      }),
    ).toEqual({
      validPrefix: ['user'],
      failedSegment: 'naem',
      availableKeys: ['name', 'email'],
    });
  });

  it('should report a failure when descending past a leaf', () => {
    expect(
      findOutputSchemaPathFailure({
        schema: testSchema,
        propertyPath: ['id', 'deeper'],
      }),
    ).toEqual({
      validPrefix: ['id'],
      failedSegment: 'deeper',
      availableKeys: [],
    });
  });

  it('should not throw when descending into a non-leaf node with a null value', () => {
    const schemaWithNullNode = {
      data: {
        isLeaf: false,
        type: 'object',
        label: 'Data',
        value: null,
      },
    } as unknown as BaseOutputSchemaV2;

    expect(
      findOutputSchemaPathFailure({
        schema: schemaWithNullNode,
        propertyPath: ['data', 'missingChild'],
      }),
    ).toEqual({
      validPrefix: ['data'],
      failedSegment: 'missingChild',
      availableKeys: [],
    });
  });
});
