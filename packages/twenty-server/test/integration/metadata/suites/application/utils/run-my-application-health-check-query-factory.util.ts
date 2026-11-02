import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RunMyApplicationHealthCheckFactoryInput = {
  applicationId: string;
};

const DEFAULT_RUN_MY_APPLICATION_HEALTH_CHECK_GQL_FIELDS = `
  status
  title
  description
`;

export const runMyApplicationHealthCheckQueryFactory = ({
  input,
  gqlFields = DEFAULT_RUN_MY_APPLICATION_HEALTH_CHECK_GQL_FIELDS,
}: PerformMetadataQueryParams<RunMyApplicationHealthCheckFactoryInput>) => ({
  query: gql`
    mutation RunMyApplicationHealthCheck($applicationId: UUID!) {
      runMyApplicationHealthCheck(applicationId: $applicationId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});
