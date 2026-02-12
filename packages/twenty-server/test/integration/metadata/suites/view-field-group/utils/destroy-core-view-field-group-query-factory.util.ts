import gql from 'graphql-tag';
import { VIEW_FIELD_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/destroy-view-field-group.input';

export const destroyCoreViewFieldGroupQueryFactory = ({
  gqlFields = VIEW_FIELD_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewFieldGroupInput>) => ({
  query: gql`
    mutation DestroyCoreViewFieldGroup($input: DestroyViewFieldGroupInput!) {
      destroyCoreViewFieldGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
