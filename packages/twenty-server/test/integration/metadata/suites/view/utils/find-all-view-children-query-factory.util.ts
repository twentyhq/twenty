import gql from 'graphql-tag';

export const findAllViewChildrenQueryFactory = ({
  listQueryName,
}: {
  listQueryName: string;
}) => ({
  query: gql`
    query FindAllViewChildren {
      ${listQueryName} {
        id
      }
    }
  `,
});
