import gql from 'graphql-tag';

export const deleteViewFilterGroupOperationFactory = ({
  viewFilterGroupId,
}: {
  viewFilterGroupId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewFilterGroup($id: String!) {
      deleteCoreViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id: viewFilterGroupId,
  },
});
