import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_FIND_MANY_APPLICATION_REGISTRATIONS_GQL_FIELDS = `
  id
  universalIdentifier
`;

export const findManyApplicationRegistrationsQueryFactory = ({
  gqlFields = DEFAULT_FIND_MANY_APPLICATION_REGISTRATIONS_GQL_FIELDS,
}: Partial<PerformMetadataQueryParams<undefined>>) => ({
  query: gql`
    query FindManyApplicationRegistrations {
      findManyApplicationRegistrations {
        ${gqlFields}
      }
    }
  `,
});
