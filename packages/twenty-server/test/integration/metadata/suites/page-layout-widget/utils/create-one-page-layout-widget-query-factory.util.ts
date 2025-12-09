import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout-widget.input';

export type CreateOnePageLayoutWidgetFactoryInput = CreatePageLayoutWidgetInput;

const DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS = `
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
  createdAt
  updatedAt
  deletedAt
`;

export const createOnePageLayoutWidgetQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOnePageLayoutWidgetFactoryInput>) => ({
  query: gql`
    mutation CreatePageLayoutWidget($input: CreatePageLayoutWidgetInput!) {
      createPageLayoutWidget(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
