import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const destroyViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewSort($input: DestroyViewSortInput!) {
      destroyCoreViewSort(input: $input) {
        ${VIEW_SORT_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
