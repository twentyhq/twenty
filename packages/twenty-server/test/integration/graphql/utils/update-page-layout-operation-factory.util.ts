import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';

type UpdatePageLayoutOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutId: string;
  data: UpdatePageLayoutInput;
};

export const updatePageLayoutOperationFactory = ({
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
  pageLayoutId,
  data,
}: UpdatePageLayoutOperationFactoryParams) => ({
  query: gql`
    mutation UpdatePageLayout($id: String!, $input: UpdatePageLayoutInput!) {
      updatePageLayout(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutId,
    input: data,
  },
});
