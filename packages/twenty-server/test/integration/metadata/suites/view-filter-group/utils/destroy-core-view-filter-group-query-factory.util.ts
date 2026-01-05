import gql from 'graphql-tag';

export const destroyCoreViewFilterGroupQueryFactory = ({
  id,
}: {
  id: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewFilterGroup($id: String!) {
      destroyCoreViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id,
  },
});
