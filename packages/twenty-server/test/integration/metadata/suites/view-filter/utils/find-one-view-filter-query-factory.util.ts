import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findOneViewFilterQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  id,
}: {
  gqlFields?: string;
  id: string;
}) => ({
  query: gql`
    query GetViewFilter($id: String!) {
      getViewFilter(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id,
  },
});
