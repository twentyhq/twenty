import gql from 'graphql-tag';

export const destroyViewFilterGroupOperationFactory = ({
  viewFilterGroupId,
}: {
  viewFilterGroupId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewFilterGroup($id: String!) {
      destroyCoreViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id: viewFilterGroupId,
  },
});
