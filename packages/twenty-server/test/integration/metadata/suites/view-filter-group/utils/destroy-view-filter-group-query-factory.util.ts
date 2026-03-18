import gql from 'graphql-tag';

export const destroyViewFilterGroupQueryFactory = ({
  id,
}: {
  id: string;
}) => ({
  query: gql`
    mutation DestroyViewFilterGroup($id: String!) {
      destroyViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id,
  },
});
