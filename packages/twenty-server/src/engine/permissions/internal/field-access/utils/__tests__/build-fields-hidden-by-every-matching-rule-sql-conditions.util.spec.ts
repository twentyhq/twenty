import { buildFieldsHiddenByEveryMatchingRuleSQLConditions } from 'src/engine/permissions/internal/field-access/utils/build-fields-hidden-by-every-matching-rule-sql-conditions.util';

const FULL_RULE = {
  fieldMetadataIds: [],
  sqlCondition: { sql: '"mail"."channel" = :full', parameters: { full: 'c1' } },
};
const METADATA_RULE = {
  fieldMetadataIds: ['subject-field-id', 'body-field-id'],
  sqlCondition: {
    sql: '"mail"."channel" = :metadata',
    parameters: { metadata: 'c3' },
  },
};
const TOPICS_RULE = {
  fieldMetadataIds: ['body-field-id'],
  sqlCondition: {
    sql: '"mail"."channel" = :topics',
    parameters: { topics: 'c2' },
  },
};

describe('buildFieldsHiddenByEveryMatchingRuleSQLConditions', () => {
  it('should hide a field where its rule matches when no other rule exists', () => {
    expect(
      buildFieldsHiddenByEveryMatchingRuleSQLConditions([TOPICS_RULE]),
    ).toEqual([
      {
        fieldMetadataIds: ['body-field-id'],
        sqlCondition: TOPICS_RULE.sqlCondition,
      },
    ]);
  });

  it('should not hide a field where a rule leaving it visible matches too', () => {
    expect(
      buildFieldsHiddenByEveryMatchingRuleSQLConditions([
        FULL_RULE,
        TOPICS_RULE,
        METADATA_RULE,
      ]),
    ).toEqual([
      {
        fieldMetadataIds: ['body-field-id'],
        sqlCondition: {
          sql: '((("mail"."channel" = :topics) OR ("mail"."channel" = :metadata))) AND ("mail"."channel" = :full) IS NOT TRUE',
          parameters: { topics: 'c2', metadata: 'c3', full: 'c1' },
        },
      },
      {
        fieldMetadataIds: ['subject-field-id'],
        sqlCondition: {
          sql: '("mail"."channel" = :metadata) AND ((("mail"."channel" = :full) OR ("mail"."channel" = :topics))) IS NOT TRUE',
          parameters: { metadata: 'c3', full: 'c1', topics: 'c2' },
        },
      },
    ]);
  });
});
