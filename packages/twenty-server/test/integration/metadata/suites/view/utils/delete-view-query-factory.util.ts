import gql from 'graphql-tag';

export const deleteViewQueryFactory = ({ viewId }: { viewId: string }) => ({
  query: gql`
    mutation DeleteView($id: String!) {
      deleteView(id: $id)
    }
  `,
  variables: {
    id: viewId,
  },
});
