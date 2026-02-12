import gql from 'graphql-tag';
import { WIDGET_CONFIGURATION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-configuration-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';

export type CreateOnePageLayoutTabFactoryInput = CreatePageLayoutTabInput;

const DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS = `
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
`;

export const createOnePageLayoutTabQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOnePageLayoutTabFactoryInput>) => ({
  query: gql`
    mutation CreatePageLayoutTab($input: CreatePageLayoutTabInput!) {
      createPageLayoutTab(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
