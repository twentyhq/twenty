import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/delete-view-tab.input';

export const deleteViewTabQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DeleteViewTabInput>) => ({
  query: gql`
    mutation DeleteViewTab($input: DeleteViewTabInput!) {
      deleteViewTab(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
