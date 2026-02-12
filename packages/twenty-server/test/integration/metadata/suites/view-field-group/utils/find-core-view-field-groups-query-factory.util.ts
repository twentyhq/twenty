import gql from 'graphql-tag';
import { VIEW_FIELD_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findCoreViewFieldGroupsQueryFactory = ({
  gqlFields = VIEW_FIELD_GROUP_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId: string;
}) => ({
  query: gql`
    query GetCoreViewFieldGroups($viewId: String!) {
      getCoreViewFieldGroups(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    viewId,
  },
});
