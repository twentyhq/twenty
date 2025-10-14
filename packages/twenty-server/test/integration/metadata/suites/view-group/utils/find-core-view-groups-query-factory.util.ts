import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findCoreViewGroupsQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId: string;
}) => ({
  query: gql`
    query GetCoreViewGroups($viewId: String!) {
      getCoreViewGroups(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    viewId,
  },
});
