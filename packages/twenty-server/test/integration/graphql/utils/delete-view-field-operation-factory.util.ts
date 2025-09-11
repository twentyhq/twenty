import gql from 'graphql-tag';

export const deleteViewFieldOperationFactory = ({
  viewFieldId,
}: {
  viewFieldId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewField($input: DeleteViewFieldInput!) {
      deleteCoreViewField(input: $input)
    }
  `,
  variables: {
    input: { id: viewFieldId },
  },
});
