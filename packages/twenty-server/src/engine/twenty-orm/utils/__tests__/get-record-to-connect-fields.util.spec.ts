import {
  type RelationConnectQueryConfig,
  type UniqueConstraintCondition,
} from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import { getRecordToConnectFields } from 'src/engine/twenty-orm/utils/get-record-to-connect-fields.util';

describe('getRecordToConnectFields', () => {
  it('should return the fields to connect', () => {
    const connectQueryConfig = {
      recordToConnectConditions: [
        [
          ['field1', 'value1'],
          ['field2', 'value2'],
        ] as UniqueConstraintCondition,
      ],
      targetObjectName: 'target',
      relationFieldName: 'relationId',
      connectFieldName: 'relation',
      uniqueConstraintFields: [],
    } as unknown as RelationConnectQueryConfig;

    const result = getRecordToConnectFields(connectQueryConfig);

    expect(result).toEqual([
      '"target"."id"',
      '"target"."field1"',
      '"target"."field2"',
    ]);
  });
});
