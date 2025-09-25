import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

import { type UpdatePageLayoutWithTabsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';

type UpdatePageLayoutWithTabsOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutId: string;
  data: UpdatePageLayoutWithTabsInput;
};

export const updatePageLayoutWithTabsOperationFactory = ({
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
  pageLayoutId,
  data,
}: UpdatePageLayoutWithTabsOperationFactoryParams) => ({
  query: gql`
    mutation UpdatePageLayoutWithTabsAndWidgets($id: String!, $input: UpdatePageLayoutWithTabsInput!) {
      updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
        ${gqlFields}
        tabs {
          id
          title
          position
          pageLayoutId
          widgets {
            id
            title
            type
            pageLayoutTabId
            objectMetadataId
            gridPosition {
              row
              column
              rowSpan
              columnSpan
            }
            configuration
          }
        }
      }
    }
  `,
  variables: {
    id: pageLayoutId,
    input: data,
  },
});
