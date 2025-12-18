import gql from 'graphql-tag';
import { WIDGET_CONFIGURATION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-configuration-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';

export type UpdateOnePageLayoutWidgetFactoryInput = {
  id: string;
} & UpdatePageLayoutWidgetInput;

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
  configuration {
    ${WIDGET_CONFIGURATION_GQL_FIELDS}
  }
  createdAt
  updatedAt
  deletedAt
`;

export const updateOnePageLayoutWidgetQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateOnePageLayoutWidgetFactoryInput>) => ({
  query: gql`
    mutation UpdatePageLayoutWidget($id: String!, $input: UpdatePageLayoutWidgetInput!) {
      updatePageLayoutWidget(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
    input: {
      title: input.title,
      type: input.type,
      objectMetadataId: input.objectMetadataId,
      gridPosition: input.gridPosition,
      configuration: input.configuration,
    },
  },
});
