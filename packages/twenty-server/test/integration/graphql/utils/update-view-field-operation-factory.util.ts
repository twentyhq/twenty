import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';

export const updateViewFieldOperationFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input,
}: {
  gqlFields?: string;
  input: UpdateViewFieldInput;
}) => ({
  query: gql`
    mutation UpdateCoreViewField($input: UpdateViewFieldInput!) {
      updateCoreViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
