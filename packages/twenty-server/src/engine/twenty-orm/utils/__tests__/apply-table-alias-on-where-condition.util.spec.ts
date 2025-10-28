import { type WhereClauseCondition } from 'typeorm/query-builder/WhereClause';

import { applyTableAliasOnWhereCondition } from 'src/engine/twenty-orm/utils/apply-table-alias-on-where-condition';

describe('applyTableAliasOnWhereCondition', () => {
  const tableName = '_listing';
  const aliasName = 'listing';

  describe('when processing simple where conditions with string conditions', () => {
    it('should replace alias name with table name in string condition', () => {
      const condition: WhereClauseCondition = [
        {
          type: 'simple',
          condition: `${aliasName}.id = :id`,
        },
      ];

      const result = applyTableAliasOnWhereCondition({
        condition,
        tableName,
        aliasName,
      });

      expect(result).toEqual([
        {
          type: 'simple',
          condition: `${tableName}.id = :id`,
        },
      ]);
    });

    it('should replace alias name with table name in array condition and wrapping operator condition', () => {
      const condition: WhereClauseCondition = [
        {
          type: 'simple',
          condition: {
            operator: 'brackets',
            condition: [
              {
                type: 'simple',
                condition: `"${aliasName}"."id" IN (:...id8oi6y)`,
              },
            ],
          },
        },
      ];

      const result = applyTableAliasOnWhereCondition({
        condition,
        tableName,
        aliasName,
      });

      expect(result).toEqual([
        {
          type: 'simple',
          condition: {
            operator: 'brackets',
            condition: [
              {
                type: 'simple',
                condition: `"${tableName}"."id" IN (:...id8oi6y)`,
              },
            ],
          },
        },
      ]);
    });

    it('should replace alias name with table name in object condition', () => {
      const condition: WhereClauseCondition = {
        parameters: ['id'],
        operator: 'equal',
      };

      const result = applyTableAliasOnWhereCondition({
        condition,
        tableName,
        aliasName,
      });

      expect(result).toEqual({
        operator: 'equal',
        parameters: ['id'],
      });
    });

    it('should replace alias name with table name in string condition without alias name', () => {
      const condition: WhereClauseCondition = [
        {
          type: 'simple',
          condition: `id = :id`,
        },
      ];

      const result = applyTableAliasOnWhereCondition({
        condition,
        tableName,
        aliasName,
      });

      expect(result).toEqual([
        {
          type: 'simple',
          condition: `id = :id`,
        },
      ]);
    });

    it('should replace alias name with table name in string condition without quotes', () => {
      const condition: WhereClauseCondition = [
        {
          type: 'simple',
          condition: `${aliasName}."id" = :id`,
        },
      ];

      const result = applyTableAliasOnWhereCondition({
        condition,
        tableName,
        aliasName,
      });

      expect(result).toEqual([
        {
          type: 'simple',
          condition: `${tableName}."id" = :id`,
        },
      ]);
    });
  });
});
