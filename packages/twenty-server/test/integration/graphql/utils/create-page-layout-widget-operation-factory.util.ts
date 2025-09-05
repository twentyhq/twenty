import gql from 'graphql-tag';
import { PAGE_LAYOUT_WIDGET_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';

type CreatePageLayoutWidgetOperationFactoryParams = {
  gqlFields?: string;
  data: CreatePageLayoutWidgetInput;
};

export const createPageLayoutWidgetOperationFactory = ({
  gqlFields = PAGE_LAYOUT_WIDGET_GQL_FIELDS,
  data,
}: CreatePageLayoutWidgetOperationFactoryParams) => ({
  query: gql`
    mutation CreatePageLayoutWidget($input: CreatePageLayoutWidgetInput!) {
      createPageLayoutWidget(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
