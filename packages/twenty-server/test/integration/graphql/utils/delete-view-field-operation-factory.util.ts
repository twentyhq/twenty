import gql from 'graphql-tag';

export const deleteViewFieldOperationFactory = ({
  viewFieldId,
}: {
  viewFieldId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewField($id: String!) {
      deleteCoreViewField(id: $id)
    }
  `,
  variables: {
    id: viewFieldId,
  },
});
