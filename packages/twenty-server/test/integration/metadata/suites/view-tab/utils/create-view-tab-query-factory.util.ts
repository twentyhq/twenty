import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';

export const createViewTabQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewTabInput>) => ({
  query: gql`
    mutation CreateViewTab($input: CreateViewTabInput!) {
      createViewTab(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
