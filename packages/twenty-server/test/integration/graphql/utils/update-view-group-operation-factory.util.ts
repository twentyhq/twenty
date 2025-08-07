import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewGroupOperationFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  viewGroupId,
  data = {},
}: {
  gqlFields?: string;
  viewGroupId: string;
  data?: object;
}) => ({
  query: gql`
    mutation UpdateCoreViewGroup($id: String!, $input: UpdateViewGroupInput!) {
      updateCoreViewGroup(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewGroupId,
    input: data,
  },
});
