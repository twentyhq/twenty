import gql from 'graphql-tag';

export const findAccessGroupPropagationProgressQueryFactory = () => ({
  query: gql`
    query AccessGroupPropagationProgress {
      accessGroupPropagationProgress {
        totalRecordCount
        remainingRecordCount
        isInProgress
      }
    }
  `,
  variables: {},
});
