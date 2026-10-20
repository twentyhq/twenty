import gql from 'graphql-tag';
import { RECORD_INHERITANCE_RULE_GQL_FIELDS } from 'test/integration/metadata/suites/record-inheritance-rule/utils/record-inheritance-rule-gql-fields.constant';

export const findRecordInheritanceRulesQueryFactory = () => ({
  query: gql`
    query RecordInheritanceRules {
      recordInheritanceRules {
        ${RECORD_INHERITANCE_RULE_GQL_FIELDS}
      }
    }
  `,
});
