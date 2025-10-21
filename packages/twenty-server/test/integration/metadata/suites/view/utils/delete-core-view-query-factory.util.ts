import gql from 'graphql-tag';

export const deleteCoreViewQueryFactory = ({ viewId }: { viewId: string }) => ({
  query: gql`
    mutation DeleteCoreView($id: String!) {
      deleteCoreView(id: $id)
    }
  `,
  variables: {
    id: viewId,
  },
});
