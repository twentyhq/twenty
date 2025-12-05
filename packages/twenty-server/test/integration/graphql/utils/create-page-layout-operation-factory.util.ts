import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';

type CreatePageLayoutOperationFactoryParams = {
  gqlFields?: string;
  data: CreatePageLayoutInput;
};

export const createPageLayoutOperationFactory = ({
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
  data,
}: CreatePageLayoutOperationFactoryParams) => ({
  query: gql`
    mutation CreatePageLayout($input: CreatePageLayoutInput!) {
      createPageLayout(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
