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
    query GetViewFilterGroups($viewId: String) {
      getViewFilterGroups(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: viewId ? { viewId } : {},
});
