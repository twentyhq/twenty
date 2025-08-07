import gql from 'graphql-tag';

export const deleteViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewSort($id: String!) {
      deleteCoreViewSort(id: $id)
    }
  `,
  variables: {
    id: viewSortId,
  },
});
