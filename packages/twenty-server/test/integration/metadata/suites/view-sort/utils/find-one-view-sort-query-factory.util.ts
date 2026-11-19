import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findOneViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  id,
}: {
  gqlFields?: string;
  id: string;
}) => ({
  query: gql`
    query GetViewSort($id: String!) {
      getViewSort(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id,
  },
});
