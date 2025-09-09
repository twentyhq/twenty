import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type DeletePageLayoutOperationFactoryParams = {
  pageLayoutId: string;
  gqlFields?: string;
};

export const deletePageLayoutOperationFactory = ({
  pageLayoutId,
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
}: DeletePageLayoutOperationFactoryParams) => ({
  query: gql`
    mutation DeletePageLayout($id: String!) {
      deletePageLayout(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutId,
  },
});
