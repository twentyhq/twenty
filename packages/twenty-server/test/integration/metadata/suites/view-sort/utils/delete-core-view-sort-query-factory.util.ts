import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const deleteCoreViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  viewSortId,
}: {
  gqlFields?: string;
  viewSortId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewSort($input: DeleteViewSortInput!) {
      deleteCoreViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
