import gql from 'graphql-tag';

export const destroyViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewSort($id: String!) {
      destroyCoreViewSort(id: $id)
    }
  `,
  variables: {
    id: viewSortId,
  },
});
