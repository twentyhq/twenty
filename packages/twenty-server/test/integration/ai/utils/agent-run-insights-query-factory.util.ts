import gql from 'graphql-tag';

type AgentRunInsightsVariables = {
  agentId: string;
  timeZone: string;
};

export const agentRunInsightsQueryFactory = (
  variables: AgentRunInsightsVariables,
) => ({
  query: gql`
    query AgentRunInsights($agentId: UUID!, $timeZone: String!) {
      agentRunInsights(agentId: $agentId, timeZone: $timeZone) {
        runCount
        tokenCount
        credits
        averageDurationInMs
        dailyRunCounts {
          completedRunCount
          failedRunCount
          otherRunCount
        }
      }
    }
  `,
  variables,
});
