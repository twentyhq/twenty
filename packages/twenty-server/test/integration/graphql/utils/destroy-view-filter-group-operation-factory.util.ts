import gql from 'graphql-tag';

export const destroyViewFilterGroupOperationFactory = ({
  viewFilterGroupId,
}: {
  viewFilterGroupId: string;
}) => ({
  query: gql`
    mutation DestroyViewFilterGroup($id: String!) {
      destroyViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id: viewFilterGroupId,
  },
});
