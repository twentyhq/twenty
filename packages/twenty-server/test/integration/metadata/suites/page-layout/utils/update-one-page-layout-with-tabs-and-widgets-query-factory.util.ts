import gql from 'graphql-tag';
import { WIDGET_CONFIGURATION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-configuration-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';

export type UpdateOnePageLayoutWithTabsAndWidgetsFactoryInput = {
  id: string;
} & UpdatePageLayoutWithTabsInput;

const DEFAULT_PAGE_LAYOUT_GQL_FIELDS = `
  id
  name
  type
  objectMetadataId
  createdAt
  updatedAt
  deletedAt
  tabs {
    id
    title
    position
    pageLayoutId
    createdAt
    updatedAt
    deletedAt
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
      configuration {
        ${WIDGET_CONFIGURATION_GQL_FIELDS}
      }
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

export const updateOnePageLayoutWithTabsAndWidgetsQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateOnePageLayoutWithTabsAndWidgetsFactoryInput>) => ({
  query: gql`
    mutation UpdatePageLayoutWithTabsAndWidgets($id: String!, $input: UpdatePageLayoutWithTabsInput!) {
      updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
    input: {
      name: input.name,
      type: input.type,
      objectMetadataId: input.objectMetadataId,
      tabs: input.tabs,
    },
  },
});
