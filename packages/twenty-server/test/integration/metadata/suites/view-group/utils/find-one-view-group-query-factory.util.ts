import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findOneViewGroupQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  id,
}: {
  gqlFields?: string;
  id: string;
}) => ({
  query: gql`
    query GetViewGroup($id: String!) {
      getViewGroup(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id,
  },
});
