import gql from 'graphql-tag';
import { PAGE_LAYOUT_WIDGET_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type FindPageLayoutWidgetsOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutTabId: string;
};

export const findPageLayoutWidgetsOperationFactory = ({
  gqlFields = PAGE_LAYOUT_WIDGET_GQL_FIELDS,
  pageLayoutTabId,
}: FindPageLayoutWidgetsOperationFactoryParams) => ({
  query: gql`
    query GetPageLayoutWidgets($pageLayoutTabId: String!) {
      getPageLayoutWidgets(pageLayoutTabId: $pageLayoutTabId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    pageLayoutTabId,
  },
});
