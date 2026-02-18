import gql from 'graphql-tag';
import { VIEW_FIELD_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';

export const createCoreViewFieldGroupQueryFactory = ({
  gqlFields = VIEW_FIELD_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewFieldGroupInput>) => ({
  query: gql`
    mutation CreateCoreViewFieldGroup($input: CreateViewFieldGroupInput!) {
      createCoreViewFieldGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
