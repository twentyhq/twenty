import gql from 'graphql-tag';
import { PAGE_LAYOUT_WIDGET_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type RestorePageLayoutWidgetOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutWidgetId: string;
};

export const restorePageLayoutWidgetOperationFactory = ({
  gqlFields = PAGE_LAYOUT_WIDGET_GQL_FIELDS,
  pageLayoutWidgetId,
}: RestorePageLayoutWidgetOperationFactoryParams) => ({
  query: gql`
    mutation RestorePageLayoutWidget($id: String!) {
      restorePageLayoutWidget(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutWidgetId,
  },
});
