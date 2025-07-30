import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewFilterOperationFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  viewFilterId,
  data = {},
}: {
  gqlFields?: string;
  viewFilterId: string;
  data?: object;
}) => ({
  query: gql`
    mutation UpdateCoreViewFilter($id: String!, $input: UpdateViewFilterInput!) {
      updateCoreViewFilter(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewFilterId,
    input: data,
  },
});
