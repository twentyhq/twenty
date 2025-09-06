import gql from 'graphql-tag';
import { PAGE_LAYOUT_WIDGET_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type DeletePageLayoutWidgetOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutWidgetId: string;
};

export const deletePageLayoutWidgetOperationFactory = ({
  gqlFields = PAGE_LAYOUT_WIDGET_GQL_FIELDS,
  pageLayoutWidgetId,
}: DeletePageLayoutWidgetOperationFactoryParams) => ({
  query: gql`
    mutation DeletePageLayoutWidget($id: String!) {
      deletePageLayoutWidget(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutWidgetId,
  },
});
