import gql from 'graphql-tag';

export const deleteCoreViewSortQueryFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewSort($viewSortId: UUID!) {
      deleteCoreViewSort(viewSortId: $viewSortId)
    }
  `,
  variables: {
    viewSortId,
  },
});
