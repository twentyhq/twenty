import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const destroyViewFieldOperationFactory = ({
  viewFieldId,
  gqlFields = VIEW_FIELD_GQL_FIELDS,
}: {
  gqlFields?: string;
  viewFieldId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewField($input: DestroyViewFieldInput!) {
      destroyCoreViewField(input: $input){
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { id: viewFieldId },
  },
});
