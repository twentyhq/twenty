import { buildFieldsUnreadableByEveryMatchingRuleSQLConditions } from 'src/engine/permissions/internal/field-access/utils/build-fields-unreadable-by-every-matching-rule-sql-conditions.util';

describe('buildFieldsUnreadableByEveryMatchingRuleSQLConditions', () => {
  it('should hide a field where a rule hiding it matches and no rule showing it does', () => {
    expect(
      buildFieldsUnreadableByEveryMatchingRuleSQLConditions([
        { fieldMetadataIds: [], sqlCondition: { sql: 'full', parameters: {} } },
        {
          fieldMetadataIds: ['body-field-id'],
          sqlCondition: { sql: 'topics', parameters: {} },
        },
        {
          fieldMetadataIds: ['subject-field-id', 'body-field-id'],
          sqlCondition: { sql: 'metadata', parameters: {} },
        },
      ]).map(({ fieldMetadataIds, sqlCondition }) => [
        fieldMetadataIds[0],
        sqlCondition.sql,
      ]),
    ).toEqual([
      ['body-field-id', '(((topics) OR (metadata))) AND (full) IS NOT TRUE'],
      ['subject-field-id', '(metadata) AND (((full) OR (topics))) IS NOT TRUE'],
    ]);
  });
});
