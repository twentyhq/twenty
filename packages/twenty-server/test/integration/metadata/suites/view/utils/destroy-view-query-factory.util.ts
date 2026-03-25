import gql from 'graphql-tag';

export const destroyViewQueryFactory = ({
  viewId,
}: {
  viewId: string;
}) => ({
  query: gql`
    mutation DestroyView($id: String!) {
      destroyView(id: $id)
    }
  `,
  variables: {
    id: viewId,
  },
});
