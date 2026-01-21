import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const destroyCoreViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  viewSortId,
}: {
  gqlFields?: string;
  viewSortId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewSort($input: DestroyViewSortInput!) {
      destroyCoreViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
