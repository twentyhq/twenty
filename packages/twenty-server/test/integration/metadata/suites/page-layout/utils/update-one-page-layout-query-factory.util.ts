import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';

export type UpdateOnePageLayoutFactoryInput = {
  id: string;
} & UpdatePageLayoutInput;

const DEFAULT_PAGE_LAYOUT_GQL_FIELDS = `
  id
  name
  type
  objectMetadataId
  createdAt
  updatedAt
  deletedAt
`;

export const updateOnePageLayoutQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateOnePageLayoutFactoryInput>) => ({
  query: gql`
    mutation UpdatePageLayout($id: String!, $input: UpdatePageLayoutInput!) {
      updatePageLayout(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
    input: {
      name: input.name,
      type: input.type,
      objectMetadataId: input.objectMetadataId,
    },
  },
});
