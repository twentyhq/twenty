import gql from 'graphql-tag';
import {
  ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS,
  ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS,
} from 'test/integration/constants/row-level-permission-predicate-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';

export const upsertRowLevelPermissionPredicatesQueryFactory = ({
  gqlFields = {
    predicates: ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS,
    predicateGroups: ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS,
  },
  input,
}: Omit<
  PerformMetadataQueryParams<UpsertRowLevelPermissionPredicatesInput>,
  'gqlFields'
> & {
  gqlFields?: {
    predicates?: string;
    predicateGroups?: string;
  };
}) => ({
  query: gql`
    mutation UpsertRowLevelPermissionPredicates(
      $input: UpsertRowLevelPermissionPredicatesInput!
    ) {
      upsertRowLevelPermissionPredicates(input: $input) {
        predicates {
          ${gqlFields.predicates}
        }
        predicateGroups {
          ${gqlFields.predicateGroups}
        }
      }
    }
  `,
  variables: {
    input,
  },
});
