import gql from 'graphql-tag';

export const destroyCoreViewSortQueryFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewSort($viewSortId: UUID!) {
      destroyCoreViewSort(viewSortId: $viewSortId)
    }
  `,
  variables: {
    viewSortId,
  },
});
