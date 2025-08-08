import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewOperationFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  viewId,
  data = {},
}: {
  gqlFields?: string;
  viewId: string;
  data?: object;
}) => ({
  query: gql`
    mutation UpdateCoreView($id: String!, $input: UpdateViewInput!) {
      updateCoreView(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewId,
    input: data,
  },
});
