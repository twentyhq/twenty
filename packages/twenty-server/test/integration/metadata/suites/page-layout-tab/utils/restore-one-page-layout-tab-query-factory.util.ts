import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RestoreOnePageLayoutTabFactoryInput = {
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
`;

export const restoreOnePageLayoutTabQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS,
}: PerformMetadataQueryParams<RestoreOnePageLayoutTabFactoryInput>) => ({
  query: gql`
    mutation RestorePageLayoutTab($id: String!) {
      restorePageLayoutTab(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
