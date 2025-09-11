import gql from 'graphql-tag';
import { UpdateViewFieldInput, } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewFieldOperationFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input
}: {
  gqlFields?: string;
  input: UpdateViewFieldInput
}) => ({
  query: gql`
    mutation UpdateCoreViewField($id: String!, $input: UpdateViewFieldInput!) {
      updateCoreViewField(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input
  },
});
