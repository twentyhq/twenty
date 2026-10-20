import gql from 'graphql-tag';
import { RECORD_INHERITANCE_RULE_GQL_FIELDS } from 'test/integration/metadata/suites/record-inheritance-rule/utils/record-inheritance-rule-gql-fields.constant';

import { type CreateRecordInheritanceRuleInput } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/create-record-inheritance-rule.input';

export const createRecordInheritanceRuleQueryFactory = (
  input: CreateRecordInheritanceRuleInput,
) => ({
  query: gql`
    mutation CreateRecordInheritanceRule(
      $input: CreateRecordInheritanceRuleInput!
    ) {
      createRecordInheritanceRule(input: $input) {
        ${RECORD_INHERITANCE_RULE_GQL_FIELDS}
      }
    }
  `,
  variables: { input },
});
