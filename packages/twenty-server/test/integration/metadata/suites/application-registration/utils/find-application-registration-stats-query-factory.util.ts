import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationRegistrationStatsFactoryInput = {
  id: string;
};

const DEFAULT_FIND_APPLICATION_REGISTRATION_STATS_GQL_FIELDS = `
  activeInstalls
  suspendedInstalls
`;

export const findApplicationRegistrationStatsQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_APPLICATION_REGISTRATION_STATS_GQL_FIELDS,
}: PerformMetadataQueryParams<FindApplicationRegistrationStatsFactoryInput>) => ({
  query: gql`
    query FindApplicationRegistrationStats($id: String!) {
      findApplicationRegistrationStats(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
