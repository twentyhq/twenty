import gql from 'graphql-tag';
import { PAGE_LAYOUT_TAB_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-tab.input';

type UpdatePageLayoutTabOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutTabId: string;
  data: UpdatePageLayoutTabInput;
};

export const updatePageLayoutTabOperationFactory = ({
  gqlFields = PAGE_LAYOUT_TAB_GQL_FIELDS,
  pageLayoutTabId,
  data,
}: UpdatePageLayoutTabOperationFactoryParams) => ({
  query: gql`
    mutation UpdatePageLayoutTab($id: String!, $input: UpdatePageLayoutTabInput!) {
      updatePageLayoutTab(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutTabId,
    input: data,
  },
});
