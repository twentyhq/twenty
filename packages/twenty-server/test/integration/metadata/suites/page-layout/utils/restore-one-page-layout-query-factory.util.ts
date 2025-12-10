import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RestoreOnePageLayoutFactoryInput = {
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

export const restoreOnePageLayoutQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<RestoreOnePageLayoutFactoryInput>) => ({
  query: gql`
    mutation RestorePageLayout($id: String!) {
      restorePageLayout(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
