import gql from 'graphql-tag';
import {
  ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS,
  ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS,
  ROW_LEVEL_PERMISSION_RULE_GQL_FIELDS,
} from 'test/integration/constants/row-level-permission-predicate-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertRowLevelPermissionRulesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';

export type UpsertRowLevelPermissionRulesGqlFields = {
  rules?: string;
  predicates?: string;
  predicateGroups?: string;
};

export const upsertRowLevelPermissionRulesQueryFactory = ({
  gqlFields = {},
  input,
}: Omit<
  PerformMetadataQueryParams<UpsertRowLevelPermissionRulesInput>,
  'gqlFields'
> & {
  gqlFields?: UpsertRowLevelPermissionRulesGqlFields;
}) => ({
  query: gql`
    mutation UpsertRowLevelPermissionRules(
      $input: UpsertRowLevelPermissionRulesInput!
    ) {
      upsertRowLevelPermissionRules(input: $input) {
        rules {
          ${gqlFields.rules ?? ROW_LEVEL_PERMISSION_RULE_GQL_FIELDS}
        }
        predicates {
          ${gqlFields.predicates ?? ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS}
        }
        predicateGroups {
          ${gqlFields.predicateGroups ?? ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS}
        }
      }
    }
  `,
  variables: {
    input,
  },
});
