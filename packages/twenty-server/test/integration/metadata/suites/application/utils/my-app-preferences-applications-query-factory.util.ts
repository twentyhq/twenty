import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export const myAppPreferencesApplicationsQueryFactory = ({
  gqlFields = 'id universalIdentifier name logoUrl hasConnectionProviders',
}: PerformMetadataQueryParams<Record<string, never>>) => ({
  query: gql`
    query MyAppPreferencesApplications {
      myAppPreferencesApplications {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
