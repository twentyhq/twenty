import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const deleteViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewSort($input: DeleteViewSortInput!) {
      deleteCoreViewSort(input: $input) {
        ${VIEW_SORT_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
