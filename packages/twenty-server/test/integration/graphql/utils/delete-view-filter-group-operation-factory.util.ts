import gql from 'graphql-tag';

export const deleteViewFilterGroupOperationFactory = ({
  viewFilterGroupId,
}: {
  viewFilterGroupId: string;
}) => ({
  query: gql`
    mutation DeleteViewFilterGroup($id: String!) {
      deleteViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id: viewFilterGroupId,
  },
});
