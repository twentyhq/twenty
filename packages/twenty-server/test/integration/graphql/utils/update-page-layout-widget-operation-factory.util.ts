import gql from 'graphql-tag';
import { PAGE_LAYOUT_WIDGET_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';

type UpdatePageLayoutWidgetOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutWidgetId: string;
  data: UpdatePageLayoutWidgetInput;
};

export const updatePageLayoutWidgetOperationFactory = ({
  gqlFields = PAGE_LAYOUT_WIDGET_GQL_FIELDS,
  pageLayoutWidgetId,
  data,
}: UpdatePageLayoutWidgetOperationFactoryParams) => ({
  query: gql`
    mutation UpdatePageLayoutWidget($id: String!, $input: UpdatePageLayoutWidgetInput!) {
      updatePageLayoutWidget(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutWidgetId,
    input: data,
  },
});
