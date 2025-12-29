import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';

export type UpdateOnePageLayoutTabFactoryInput = {
  id: string;
} & UpdatePageLayoutTabInput;

const DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS = `
  id
  title
  position
  pageLayoutId
  createdAt
  updatedAt
  deletedAt
`;

export const updateOnePageLayoutTabQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateOnePageLayoutTabFactoryInput>) => ({
  query: gql`
    mutation UpdatePageLayoutTab($id: String!, $input: UpdatePageLayoutTabInput!) {
      updatePageLayoutTab(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
    input: {
      title: input.title,
      position: input.position,
    },
  },
});
