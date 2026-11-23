import gql from 'graphql-tag';

export const findViewChildQueryFactory = ({
  oneQueryName,
  childId,
}: {
  oneQueryName: string;
  childId: string;
}) => ({
  query: gql`
    query FindViewChild($id: String!) {
      ${oneQueryName}(id: $id) {
        id
      }
    }
  `,
  variables: { id: childId },
});
