import gql from 'graphql-tag';

export const agentRunSummariesQueryFactory = () => ({
  query: gql`
    query AgentRunSummaries {
      agentRunSummaries {
        agentId
        runCountLast14Days
        recentRuns {
          id
          status
        }
      }
    }
  `,
});
