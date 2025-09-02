import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type RestorePageLayoutOperationFactoryParams = {
  gqlFields?: string;
  pageLayoutId: string;
};

export const restorePageLayoutOperationFactory = ({
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
  pageLayoutId,
}: RestorePageLayoutOperationFactoryParams) => ({
  query: gql`
    mutation RestorePageLayout($id: String!) {
      restorePageLayout(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: pageLayoutId,
  },
});
