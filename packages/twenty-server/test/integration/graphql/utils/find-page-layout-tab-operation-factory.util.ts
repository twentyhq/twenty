import gql from 'graphql-tag';
import { PAGE_LAYOUT_TAB_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type FindPageLayoutTabOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutTabId: string;
};

export const findPageLayoutTabOperationFactory = ({
  gqlFields = PAGE_LAYOUT_TAB_GQL_FIELDS,
  pageLayoutTabId,
}: FindPageLayoutTabOperationFactoryParams) => ({
  query: gql`
    query GetPageLayoutTab($id: String!) {
      getPageLayoutTab(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutTabId,
  },
});
