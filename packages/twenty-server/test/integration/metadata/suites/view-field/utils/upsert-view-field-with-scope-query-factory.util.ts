import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertViewFieldWithScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/upsert-view-field-with-scope.input';

const VIEW_FIELD_WITH_SCOPE_GQL_FIELDS = `
  viewField {
    id
    viewId
    fieldMetadataId
    settings {
      label
      recordLimit
    }
  }
  scopeView {
    id
    type
    objectMetadataId
    ownerViewFieldId
    visibility
    createdByUserWorkspaceId
    viewFilters {
      id
      fieldMetadataId
      operand
      value
      viewFilterGroupId
    }
    viewFilterGroups {
      id
      logicalOperator
    }
    viewSorts {
      id
      fieldMetadataId
      direction
    }
  }
`;

export const upsertViewFieldWithScopeQueryFactory = ({
  gqlFields = VIEW_FIELD_WITH_SCOPE_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpsertViewFieldWithScopeInput>) => ({
  query: gql`
    mutation UpsertViewFieldWithScope($input: UpsertViewFieldWithScopeInput!) {
      upsertViewFieldWithScope(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
