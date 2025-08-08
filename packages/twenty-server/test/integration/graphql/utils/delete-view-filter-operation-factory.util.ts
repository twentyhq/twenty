import gql from 'graphql-tag';

export const deleteViewFilterOperationFactory = ({
  viewFilterId,
}: {
  viewFilterId: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewFilter($id: String!) {
      deleteCoreViewFilter(id: $id)
    }
  `,
  variables: {
    id: viewFilterId,
  },
});
