import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindPageLayoutTabsFactoryInput = {
  pageLayoutId: string;
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

export const findPageLayoutTabsQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_TAB_GQL_FIELDS,
}: PerformMetadataQueryParams<FindPageLayoutTabsFactoryInput>) => ({
  query: gql`
    query GetPageLayoutTabs($pageLayoutId: String!) {
      getPageLayoutTabs(pageLayoutId: $pageLayoutId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    pageLayoutId: input.pageLayoutId,
  },
});
