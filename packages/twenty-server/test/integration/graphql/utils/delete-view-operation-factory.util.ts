import gql from 'graphql-tag';

export const deleteViewOperationFactory = ({ viewId }: { viewId: string }) => ({
  query: gql`
    mutation DeleteCoreView($id: String!) {
      deleteCoreView(id: $id)
    }
  `,
  variables: {
    id: viewId,
  },
});
