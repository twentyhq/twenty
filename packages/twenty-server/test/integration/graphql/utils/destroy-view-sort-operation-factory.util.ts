import gql from 'graphql-tag';

export const destroyViewSortOperationFactory = ({
  viewSortId,
}: {
  viewSortId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewSort($input: DestroyViewSortInput!) {
      destroyCoreViewSort(input: $input)
    }
  `,
  variables: {
    input: { id: viewSortId },
  },
});
