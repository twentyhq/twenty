import gql from 'graphql-tag';
import { WIDGET_CONFIGURATION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-configuration-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOnePageLayoutWidgetFactoryInput = {
  id: string;
};

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

export const deleteOnePageLayoutWidgetQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS,
}: PerformMetadataQueryParams<DeleteOnePageLayoutWidgetFactoryInput>) => ({
  query: gql`
    mutation DeletePageLayoutWidget($id: String!) {
      deletePageLayoutWidget(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
