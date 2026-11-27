import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findOneViewFilterGroupQueryFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  id,
}: {
  gqlFields?: string;
  id: string;
}) => ({
  query: gql`
    query GetViewFilterGroup($id: String!) {
      getViewFilterGroup(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id,
  },
});
