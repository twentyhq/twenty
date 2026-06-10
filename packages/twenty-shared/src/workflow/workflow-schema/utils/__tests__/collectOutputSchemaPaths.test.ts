import { type BaseOutputSchemaV2 } from '../../types/base-output-schema.type';
import { collectOutputSchemaPaths } from '../collectOutputSchemaPaths';

describe('collectOutputSchemaPaths', () => {
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
      },
    },
    id: {
      isLeaf: true,
      type: 'string',
      label: 'id',
      value: '1',
    },
  };

  it('should enumerate both intermediate nodes and leaves', () => {
    expect(collectOutputSchemaPaths(testSchema)).toEqual([
      'user',
      'user.name',
      'id',
    ]);
  });

  it('should return an empty array for an empty schema', () => {
    expect(collectOutputSchemaPaths({})).toEqual([]);
  });

  it('should not throw when a non-leaf node has a null value', () => {
    const schemaWithNullNode = {
      data: {
        isLeaf: false,
        type: 'object',
        label: 'Data',
        value: null,
      },
      id: {
        isLeaf: true,
        type: 'string',
        label: 'id',
        value: '1',
      },
    } as unknown as BaseOutputSchemaV2;

    expect(collectOutputSchemaPaths(schemaWithNullNode)).toEqual(['data', 'id']);
  });
});
