import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';

export const createViewQueryFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewInput>) => ({
  query: gql`
    mutation CreateView($input: CreateViewInput!) {
      createView(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
