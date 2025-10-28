import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type FindPageLayoutOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutId: string;
};

export const findPageLayoutOperationFactory = ({
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
  pageLayoutId,
}: FindPageLayoutOperationFactoryParams) => ({
  query: gql`
    query GetPageLayout($id: String!) {
      getPageLayout(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutId,
  },
});
