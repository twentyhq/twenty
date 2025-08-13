import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewFilterGroupOperationFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  viewFilterGroupId,
}: {
  gqlFields?: string;
  viewFilterGroupId: string;
}) => ({
  query: gql`
    query GetCoreViewFilterGroup($id: String!) {
      getCoreViewFilterGroup(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewFilterGroupId,
  },
});
