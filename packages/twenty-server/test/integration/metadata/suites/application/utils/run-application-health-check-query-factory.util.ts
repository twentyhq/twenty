import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RunApplicationHealthCheckFactoryInput = {
  applicationId: string;
};

const DEFAULT_RUN_APPLICATION_HEALTH_CHECK_GQL_FIELDS = `
  status
  title
`;

export const runApplicationHealthCheckQueryFactory = ({
  input,
  gqlFields = DEFAULT_RUN_APPLICATION_HEALTH_CHECK_GQL_FIELDS,
}: PerformMetadataQueryParams<RunApplicationHealthCheckFactoryInput>) => ({
  query: gql`
    mutation RunApplicationHealthCheck($applicationId: UUID!) {
      runApplicationHealthCheck(applicationId: $applicationId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});
