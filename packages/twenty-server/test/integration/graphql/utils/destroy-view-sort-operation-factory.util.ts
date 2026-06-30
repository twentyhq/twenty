import gql from 'graphql-tag';

export const destroyViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DestroyViewSort($input: DestroyViewSortInput!) {
      destroyViewSort(input: $input)
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
