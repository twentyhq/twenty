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
});
