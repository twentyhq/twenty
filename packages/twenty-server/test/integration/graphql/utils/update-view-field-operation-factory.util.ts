import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewFieldOperationFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  viewFieldId,
  data = {},
}: {
  gqlFields?: string;
  viewFieldId: string;
  data?: object;
}) => ({
  query: gql`
    mutation UpdateCoreViewField($id: String!, $input: UpdateViewFieldInput!) {
      updateCoreViewField(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewFieldId,
    input: data,
  },
});
