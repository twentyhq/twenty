import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOnePageLayoutWidgetFactoryInput = {
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
  configuration
  createdAt
  updatedAt
  deletedAt
`;

export const findOnePageLayoutWidgetQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOnePageLayoutWidgetFactoryInput>) => ({
  query: gql`
    query GetPageLayoutWidget($id: String!) {
      getPageLayoutWidget(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
