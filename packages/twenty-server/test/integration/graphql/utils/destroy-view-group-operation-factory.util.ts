import gql from 'graphql-tag';

export const destroyViewGroupOperationFactory = ({
  viewGroupId,
}: {
  viewGroupId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewGroup($id: String!) {
      destroyCoreViewGroup(id: $id)
    }
  `,
  variables: {
    id: viewGroupId,
  },
});
