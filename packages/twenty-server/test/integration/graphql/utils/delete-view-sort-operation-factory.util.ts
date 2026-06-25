import gql from 'graphql-tag';

export const deleteViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DeleteViewSort($input: DeleteViewSortInput!) {
      deleteViewSort(input: $input)
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
