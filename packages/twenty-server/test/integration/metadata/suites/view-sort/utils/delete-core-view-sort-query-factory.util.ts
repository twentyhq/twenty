import gql from 'graphql-tag';

export const deleteCoreViewSortQueryFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewSort($input: DeleteViewSortInput!) {
      deleteCoreViewSort(input: $input)
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
