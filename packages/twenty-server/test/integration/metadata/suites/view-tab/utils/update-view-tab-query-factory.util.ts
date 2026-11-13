import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/update-view-tab.input';

export const updateViewTabQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateViewTabInput>) => ({
  query: gql`
    mutation UpdateViewTab($input: UpdateViewTabInput!) {
      updateViewTab(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
