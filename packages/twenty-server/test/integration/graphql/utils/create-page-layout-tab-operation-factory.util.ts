import gql from 'graphql-tag';
import { PAGE_LAYOUT_TAB_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout-tab.input';

type CreatePageLayoutTabOperationFactoryParams = {
  gqlFields?: string;
  data: CreatePageLayoutTabInput;
};

export const createPageLayoutTabOperationFactory = ({
  gqlFields = PAGE_LAYOUT_TAB_GQL_FIELDS,
  data,
}: CreatePageLayoutTabOperationFactoryParams) => ({
  query: gql`
    mutation CreatePageLayoutTab($input: CreatePageLayoutTabInput!) {
      createPageLayoutTab(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
