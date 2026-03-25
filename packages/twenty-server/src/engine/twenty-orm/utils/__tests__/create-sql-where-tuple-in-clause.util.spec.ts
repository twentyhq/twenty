import { createSqlWhereTupleInClause } from 'src/engine/twenty-orm/utils/create-sql-where-tuple-in-clause.utils';

describe('createSqlWhereTupleInClause', () => {
  it('should create a valid SQL WHERE clause for a tuple IN clause', () => {
    const conditions = [
      [
        ['field1', 'value1'] as [string, string],
        ['field2', 'value2'] as [string, string],
      ],
      [
        ['field1', 'value3'] as [string, string],
        ['field2', 'value4'] as [string, string],
      ],
    ];
    const tableName = 'table_name';

    const result = createSqlWhereTupleInClause(conditions, tableName);

    expect(result.clause).toBe(
      '("table_name"."field1", "table_name"."field2") IN ((:value0_0, :value0_1), (:value1_0, :value1_1))',
    );
    expect(result.parameters).toEqual({
      value0_0: 'value1',
      value0_1: 'value2',
      value1_0: 'value3',
      value1_1: 'value4',
    });
  });
});
