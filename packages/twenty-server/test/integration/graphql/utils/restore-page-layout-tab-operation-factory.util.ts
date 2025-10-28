import gql from 'graphql-tag';
import { PAGE_LAYOUT_TAB_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type RestorePageLayoutTabOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutTabId: string;
};

export const restorePageLayoutTabOperationFactory = ({
  gqlFields = PAGE_LAYOUT_TAB_GQL_FIELDS,
  pageLayoutTabId,
}: RestorePageLayoutTabOperationFactoryParams) => ({
  query: gql`
    mutation RestorePageLayoutTab($id: String!) {
      restorePageLayoutTab(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutTabId,
  },
});
