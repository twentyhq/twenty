import gql from 'graphql-tag';

export const destroyCoreViewQueryFactory = ({
  viewId,
}: {
  viewId: string;
}) => ({
  query: gql`
    mutation DestroyCoreView($id: String!) {
      destroyCoreView(id: $id)
    }
  `,
  variables: {
    id: viewId,
  },
});
