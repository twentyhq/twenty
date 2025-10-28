import gql from 'graphql-tag';
import { PAGE_LAYOUT_TAB_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type FindPageLayoutTabsOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutId: string;
};

export const findPageLayoutTabsOperationFactory = ({
  gqlFields = PAGE_LAYOUT_TAB_GQL_FIELDS,
  pageLayoutId,
}: FindPageLayoutTabsOperationFactoryParams) => ({
  query: gql`
    query GetPageLayoutTabs($pageLayoutId: String!) {
      getPageLayoutTabs(pageLayoutId: $pageLayoutId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    pageLayoutId,
  },
});
