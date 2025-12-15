import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOnePageLayoutFactoryInput = {
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
`;

export const deleteOnePageLayoutQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<DeleteOnePageLayoutFactoryInput>) => ({
  query: gql`
    mutation DeletePageLayout($id: String!) {
      deletePageLayout(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
