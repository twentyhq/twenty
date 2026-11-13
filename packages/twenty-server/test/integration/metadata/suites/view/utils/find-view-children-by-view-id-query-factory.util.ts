import gql from 'graphql-tag';

export const findViewChildrenByViewIdQueryFactory = ({
  listQueryName,
  viewId,
}: {
  listQueryName: string;
  viewId: string;
}) => ({
  query: gql`
    query FindViewChildrenByViewId($viewId: String!) {
      ${listQueryName}(viewId: $viewId) {
        id
      }
    }
  `,
  variables: { viewId },
});
