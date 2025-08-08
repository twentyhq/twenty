import gql from 'graphql-tag';

export const deleteViewGroupOperationFactory = ({
  viewGroupId,
}: {
  viewGroupId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewGroup($id: String!) {
      deleteCoreViewGroup(id: $id)
    }
  `,
  variables: {
    id: viewGroupId,
  },
});
