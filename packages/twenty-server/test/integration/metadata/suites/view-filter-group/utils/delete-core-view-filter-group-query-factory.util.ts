import gql from 'graphql-tag';

export const deleteCoreViewFilterGroupQueryFactory = ({
  id,
}: {
  id: string;
}) => ({
  query: gql`
    mutation DeleteCoreViewFilterGroup($id: String!) {
      deleteCoreViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id,
  },
});
