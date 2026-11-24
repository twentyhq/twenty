import gql from 'graphql-tag';

export const getServerAdminsQueryFactory = () => ({
  query: gql`
    query GetServerAdmins {
      getServerAdmins {
        id
      }
    }
  `,
});
