import gql from 'graphql-tag';

export const destroyViewFilterOperationFactory = ({
  viewFilterId,
}: {
  viewFilterId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewFilter($id: String!) {
      destroyCoreViewFilter(id: $id)
    }
  `,
  variables: {
    id: viewFilterId,
  },
});
