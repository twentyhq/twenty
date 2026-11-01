import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationRegistrationMonitoringFactoryInput = {
  id: string;
};

const DEFAULT_FIND_APPLICATION_REGISTRATION_MONITORING_GQL_FIELDS = `
  lookbackInHours
  runCount
  failedRunCount
  lifecycleFailureCount
  rateLimitEventCount
  creditsUsed
  creditUsage {
    bucketStart
    operationType
    creditsUsed
  }
  activity {
    bucketStart
    errorCount
    rateLimitedRequestCount
    rateLimitedJobCount
  }
  issues {
    level
    source
    errorCode
    logicFunctionName
    versions
    eventCount
    affectedInstallCount
    lastSeenAt
  }
  versions {
    version
    runCount
    failedRunCount
    activeInstallCount
  }
  functions {
    logicFunctionName
    runCount
    failedRunCount
    p95DurationMs
  }
`;

export const findApplicationRegistrationMonitoringQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_APPLICATION_REGISTRATION_MONITORING_GQL_FIELDS,
}: PerformMetadataQueryParams<FindApplicationRegistrationMonitoringFactoryInput>) => ({
  query: gql`
    query FindApplicationRegistrationMonitoring($id: String!) {
      findApplicationRegistrationMonitoring(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
