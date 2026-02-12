import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';

export type CreateOnePageLayoutFactoryInput = CreatePageLayoutInput;

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

export const createOnePageLayoutQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOnePageLayoutFactoryInput>) => ({
  query: gql`
    mutation CreatePageLayout($input: CreatePageLayoutInput!) {
      createPageLayout(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
