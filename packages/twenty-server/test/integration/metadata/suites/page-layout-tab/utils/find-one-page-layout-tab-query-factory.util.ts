import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOnePageLayoutTabFactoryInput = {
  id: string;
};

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
    configuration
    createdAt
    updatedAt
    deletedAt
  }
`;

export const findOnePageLayoutTabQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOnePageLayoutTabFactoryInput>) => ({
  query: gql`
    query GetPageLayoutTab($id: String!) {
      getPageLayoutTab(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
