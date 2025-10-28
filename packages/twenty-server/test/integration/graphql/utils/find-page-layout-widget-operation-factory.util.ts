import gql from 'graphql-tag';
import { PAGE_LAYOUT_WIDGET_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type FindPageLayoutWidgetOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutWidgetId: string;
};

export const findPageLayoutWidgetOperationFactory = ({
  gqlFields = PAGE_LAYOUT_WIDGET_GQL_FIELDS,
  pageLayoutWidgetId,
}: FindPageLayoutWidgetOperationFactoryParams) => ({
  query: gql`
    query GetPageLayoutWidget($id: String!) {
      getPageLayoutWidget(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutWidgetId,
  },
});
