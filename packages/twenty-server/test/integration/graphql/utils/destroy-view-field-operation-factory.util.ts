import gql from 'graphql-tag';

export const destroyViewFieldOperationFactory = ({
  viewFieldId,
}: {
  viewFieldId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewField($id: String!) {
      destroyCoreViewField(id: $id)
    }
  `,
  variables: {
    id: viewFieldId,
  },
});
