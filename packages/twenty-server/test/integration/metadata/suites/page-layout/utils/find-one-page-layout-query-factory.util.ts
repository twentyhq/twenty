import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOnePageLayoutFactoryInput = {
  id: string;
};

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
  }
`;

export const findOnePageLayoutQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOnePageLayoutFactoryInput>) => ({
  query: gql`
    query GetPageLayout($id: String!) {
      getPageLayout(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
