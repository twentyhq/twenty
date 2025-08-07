import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewFilterGroupsOperationFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId?: string;
} = {}) => ({
  query: gql`
    query GetCoreViewFilterGroups($viewId: String) {
      getCoreViewFilterGroups(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: viewId ? { viewId } : {},
});
