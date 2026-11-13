import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/destroy-view-tab.input';

export const destroyViewTabQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewTabInput>) => ({
  query: gql`
    mutation DestroyViewTab($input: DestroyViewTabInput!) {
      destroyViewTab(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
